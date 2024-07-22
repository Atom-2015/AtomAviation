import { Component, Injectable, OnInit } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import { UploadFileComponent } from '../upload-file/upload-file.component';
import { StateService } from '../state/state.service';
import * as MapboxDraw from '@mapbox/mapbox-gl-draw';
import * as mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
export class TreeItemNode {
  children!: TreeItemNode[];
  item!: string;
  code!: string;
  value?: string;
}

export class TreeItemFlatNode {
  item!: string;
  level!: number;
  expandable!: boolean;
  code!: string;
  value?: string;
}

@Injectable()
export class ChecklistDatabaseMap {
  dataChange = new BehaviorSubject<TreeItemNode[]>([]);
  treeData: any[] = [];

  get data(): TreeItemNode[] {
    return this.dataChange.value;
  }

  initialize(data: any) {
    this.treeData = data;
    const dataNodes = this.buildFileTree(this.treeData, '0');
    this.dataChange.next(dataNodes);
  }

  buildFileTree(obj: any, level: string): TreeItemNode[] {
    if (level.split('.').length > 3 || obj === null) {
      return [];
    } else {
    return Object.keys(obj).map(key => {
      const node = new TreeItemNode();
      node.item = key;
      node.code = level + '.' + key;
      node.value = obj[key];
      if (typeof obj[key] === 'object' && Object.keys(obj[key]).length > 0) {
        node.children = this.buildFileTree(obj[key], node.code);
      }
      return node;
    });
  }
  }

  filter(filterText: string) {
    let filteredTreeData: any[] = [];

    if (filterText) {
      const lowerCaseFilterText = filterText.toLowerCase();
      const filterRecursive = (node: any, path: string[] = []) => {
        const keys = Object.keys(node);
        for (const key of keys) {
          const currentPath = [...path, key];
          if (key.toLowerCase().includes(lowerCaseFilterText)) {
            let obj: any = filteredTreeData;
            currentPath.forEach((p, idx) => {
              obj[p] = obj[p] || (idx === currentPath.length - 1 ? node[key] : {});
              obj = obj[p];
            });
          }
          if (typeof node[key] === 'object') {
            filterRecursive(node[key], currentPath);
          }
        }
      };
      filterRecursive(this.treeData);
    } else {
      filteredTreeData = this.treeData;
    }
    const dataNodes = this.buildFileTree(filteredTreeData, '0');
    this.dataChange.next(dataNodes);
  }
}

@Component({
  selector: 'app-map-box',
  templateUrl: './map-box.component.html',
  styleUrls: ['./map-box.component.scss']
})
export class MapBoxComponent implements OnInit {
  stateData: any;
  user: any;
  loading = false;
  map: mapboxgl.Map | any
  draw: MapboxDraw | any
  flatNodeMap = new Map<TreeItemFlatNode, TreeItemNode>();
  nestedNodeMap = new Map<TreeItemNode, TreeItemFlatNode>();
  selectedParent: TreeItemFlatNode | null = null;
  newItemName = '';
  treeControl: FlatTreeControl<TreeItemFlatNode>;
  treeFlattener: MatTreeFlattener<TreeItemNode, TreeItemFlatNode>;
  dataSource: MatTreeFlatDataSource<TreeItemNode, TreeItemFlatNode>;
  checklistSelection = new SelectionModel<TreeItemFlatNode>(false);
  userType = localStorage.getItem("user_type")
  constructor(public dialog: MatDialog, private stateService: StateService, private http: HttpClient, private database: ChecklistDatabaseMap) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<TreeItemFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    database.dataChange.subscribe(data => {
      this.dataSource.data = data;
    });
    this.draw = new MapboxDraw({
      displayControlsDefault: true,
      // Select which mapbox-gl-draw control buttons to add to the map.
      controls: {
        polygon: true,
        trash: true
      },
      // defaultMode: 'draw_polygon',
    });
  }

  getLevel = (node: TreeItemFlatNode) => node.level;
  isExpandable = (node: TreeItemFlatNode) => node.expandable;
  getChildren = (node: TreeItemNode): TreeItemNode[] => node.children;
  hasChild = (_: number, _nodeData: TreeItemFlatNode) => _nodeData.expandable;

  transformer = (node: TreeItemNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.item === node.item
      ? existingNode
      : new TreeItemFlatNode();
    flatNode.item = node.item;
    flatNode.level = level;
    flatNode.code = node.code;
    flatNode.value = node.value;
    flatNode.expandable = node.children && node.children.length > 0;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }

  filterChanged(filter: any) {
    this.database.filter(filter.target.value);
    if (filter.target.value) {
      this.treeControl.expandAll();
    } else {
      this.treeControl.collapseAll();
    }
  }

  ngOnInit(): void {
    this.getStateData();
    (mapboxgl as typeof mapboxgl).accessToken = 'pk.eyJ1IjoibmlraXRhY2hhdWhhbjEyMyIsImEiOiJjbGwwaWxrdzEwZW02M2pxcjN4eHo1bDR1In0.I4yZh8CAQOz2c63IsCBOpg';
    this.map = new mapboxgl.Map({
      container: 'map', // container ID
      attributionControl: false,
      // style: 'mapbox://styles/mapbox/light-v11', // style URL
      center: [77.22445000, 28.63576000], // starting position [lng, lat]
      zoom: 9 // starting zoom
    });
    this.map.addControl(this.draw);
    this.map.on('draw.create', (event: any) => {
      const features = event.features;
      if (features.length > 0) {
        const coordinates = features[0].geometry.coordinates;
        console.log(features[0].geometry.type === "LineString")
        if (features[0].geometry.type === "LineString") {
          const line = turf.lineString(coordinates);
          const length = turf.length(line, { units: 'kilometers' });
          console.log('Length:', length, 'kilometers');
        }
        if (features[0].geometry.type === "Polygon") {
          const polygon = turf.polygon(coordinates);

          const area = turf.area(polygon);
          console.log('Area:', area, 'square meters');
        }
      }
    });

    var geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      placeholder: 'search in map… '
    });

    const mapElement = document.getElementById('custom-geocoder');
    if (mapElement) {
      mapElement.appendChild(geocoder.onAdd(this.map as any));
    }
  }

  getStateData() {
    this.stateService.fetchStateAPI().subscribe((resp: any) => {
      this.database.initialize(resp.data)
    })
    // this.database.initialize(data);
  }

  // onCheckboxChange(event: any, node: any): void {
  //   console.log('Checkbox change event: ', event);
  //   console.log('Node: ', node)
  // }

  onCheckboxChange(event: any, node: any): void {
    console.log('Checkbox change event: ', event);
    console.log('Node: ', node);
    this.checklistSelection.clear(); // Clear previous selection
    this.checklistSelection.toggle(node);
    // Handle the checkbox change event here
    // For example, you can update the form or state based on the checkbox state
    if (event.checked) {
      // Fetch geojson data and add layers to the map
      this.stateService.fetchGeoJsonData(node.value.table_name).subscribe((resp) => {
        console.log("res===========", resp);
        console.log("co ordinsted", resp.data.features[0].geometry.coordinates);

        const coordinates =  resp.data.features[0].geometry.type === "LineString" ? resp.data.features[0].geometry.coordinates[0] :  resp.data.features[0].geometry.coordinates[0][0] ? resp.data.features[0].geometry.coordinates[0][0] : resp.data.features[0].geometry.coordinates;

        this.map.setCenter(coordinates);

        // Add the source if it doesn't exist
        if (!this.map.getSource('maine')) {
          this.map.addSource('maine', {
            'type': 'geojson',
            'data': resp.data
          });
        }

        // Remove existing layers if any
        if (this.map.getLayer('maine')) {
          this.map.removeLayer('maine');
        }
        if (this.map.getLayer('outline')) {
          this.map.removeLayer('outline');
        }

        // Add new layers based on the geometry type
        if (resp.data.features[0].geometry.type === "Polygon") {
          console.log("resp =============>>", resp);
          // Add a new layer to visualize the polygon.
          this.map.addLayer({
            'id': 'maine',
            'type': 'fill',
            'source': 'maine', // reference the data source
            'layout': {},
            'paint': {
              'fill-color': resp.data.features[0].properties.stroke,
              'fill-opacity': 0.5
            }
          });
          // Add a black outline around the polygon.
          this.map.addLayer({
            'id': 'outline',
            'type': 'line',
            'source': 'maine',
            'layout': {},
            'paint': {
              'line-color': '#000',
              'line-width': 1
            }
          });
        }
        if (resp.data.features[0].geometry.type === "Point") {
          this.map.addLayer({
            'id': 'maine',
            'type': 'circle',
            'source': 'maine',
            'paint': {
              'circle-radius': 4,
              'circle-stroke-width': 2,
              'circle-color': 'red',
              'circle-stroke-color': 'white'
            }
          });
        }
        if (resp.data.features[0].geometry.type === "LineString") {
          this.map.addLayer({
            'id': 'maine',
            'type': 'line',
            'source': 'maine',
            'layout': {
              'line-join': 'round',
              'line-cap': 'round'
            },
            'paint': {
              'line-color': '#BF93E4',
              'line-width': 10
            }
          });
          this.map.jumpTo({
            center: coordinates,
            zoom: 15 // Set your desired zoom level
          });
        }
      });
      const popup: any = document.getElementById('popup');
      const cancelIcon: any = document.getElementById('cancel-icon');

      this.map.on('click', (e: any) => {
        const features = this.map.queryRenderedFeatures(e.point);
        if (features.length) {
          console.log(features)
          const feature = features[0];
          const dataRows = node.value.data.map((data: any) => `
  <tr>
    <th style="border: 1px solid #ddd; padding: 8px;">${data[0]}</th>
    <td style="border: 1px solid #ddd; padding: 8px;">${data[1]}</td>
  </tr>
`).join('');

          popup.innerHTML = `
          <table style="border-collapse: collapse; border: 1px solid #ddd;">
            <tr>
              <th style="border: 1px solid #ddd; padding: 8px;">Id</th>
              <td style="border: 1px solid #ddd; padding: 8px;">${feature.properties.id}</td>
            </tr>
            <tr>
              <th style="border: 1px solid #ddd; padding: 8px;">Fill opacity</th>
              <td style="border: 1px solid #ddd; padding: 8px;">${feature.properties['fill-opacity']}</td>
            </tr>
            <tr>
              <th style="border: 1px solid #ddd; padding: 8px;">Stroke</th>
              <td style="border: 1px solid #ddd; padding: 8px;">${feature.properties.stroke}</td>
            </tr>
            <tr>
              <th style="border: 1px solid #ddd; padding: 8px;">Stroke opacity</th>
              <td style="border: 1px solid #ddd; padding: 8px;">${feature.properties['stroke-opacity']}</td>
            </tr>
            ${dataRows}
          </table>`;

          popup.style.display = 'block';
          // cancelIcon.style.display = 'inline-block'; // Show the cancel icon
        } else {
          popup.style.display = 'none';
          cancelIcon.style.display = 'none'; // Hide the cancel icon
        }
      });

      cancelIcon.addEventListener('click', () => {
        popup.style.display = 'none';
        cancelIcon.style.display = 'none'; // Hide the cancel icon when clicked
      });

    } else {
      // Remove layers from the map if checkbox is unchecked
      if (this.map.getLayer('maine')) {
        this.map.removeLayer('maine');
      }
      if (this.map.getLayer('outline')) {
        this.map.removeLayer('outline');
      }
    }
  }

  openPopup() {
    this.dialog.open(UploadFileComponent, {
      width: '550px',
      height: '360px',
      panelClass: 'custom-dialog-container',
      data: {
        name: '',
        city: '',
        state: '',
        tableData: '',
        input: ''
      }
    }).afterClosed().subscribe((resp) => {

      let form = new FormData()
      this.loading = true;
      if (resp.input && resp.input.files && resp.input.files.length > 0) {
        const file = resp.input.files[0];
        const username: any = localStorage.getItem("username")
        form.append("input_file", file)
        form.append("layer_name", resp.name)
        form.append("city", resp.city)
        form.append("state", resp.state)
        form.append("mail", username)
        form.append("dbpwd", "1234")
        form.append("layer_data", JSON.stringify(resp.tableData))

        console.log(resp.tableData);
        console.log(form)
        this.postData(form).subscribe((res: any) => {
          this.getStateData()

          this.loading = false;
        }, () => this.loading = false)
      } else {
        this.loading = false;
      }
    });
  }

  postData(form: any) {
    console.log("form =============", form)
    return this.http.post<any>(`https://futurelandplans.com/api/upload_file_postgres/`, form);
  }
}
