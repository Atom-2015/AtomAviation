import { Component, Injectable, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { BehaviorSubject } from 'rxjs';

export class TreeItemNode {
  children!: TreeItemNode[];
  item!: string;
  code!: string;
  tableName?: string; // Optional as it might not be present at all levels
}

/** Flat to-do item node with expandable and level information */
export class TreeItemFlatNode {
  item!: string;
  level!: number;
  expandable!: boolean;
  code!: string;
  tableName?: string; // Optional as it might not be present at all levels
}

interface TreeNode {
  item: string;
  children?: TreeNode[];
}

@Injectable()
@Injectable()
export class ChecklistDatabase {
  dataChange = new BehaviorSubject<TreeItemNode[]>([]);
  treeData!: any[];
  get data(): TreeItemNode[] { return this.dataChange.value; }

  constructor() {}

  initialize(treeData: any) {
    this.treeData = treeData;
    const data = this.buildFileTree(treeData, '0');
    this.dataChange.next(data);
  }

  buildFileTree(obj: any[], level: string): TreeItemNode[] {
    return obj.filter(o =>
      (<string>o.code).startsWith(level + '.')
      && (o.code.match(/\./g) || []).length === (level.match(/\./g) || []).length + 1
    )
      .map(o => {
        const node = new TreeItemNode();
        node.item = o.text;
        node.code = o.code;
        node.tableName = o.tableName;
        node.children = this.buildFileTree(obj, o.code);
        return node;
      });
  }

  public filter(filterText: string) {
    let filteredTreeData: any;
    if (filterText) {
      filteredTreeData = this.treeData.filter(d => d.text.toLocaleLowerCase().indexOf(filterText.toLocaleLowerCase()) > -1);
      Object.assign([], filteredTreeData).forEach((ftd: any) => {
        let str = (<string>ftd.code);
        while (str.lastIndexOf('.') > -1) {
          const index = str.lastIndexOf('.');
          str = str.substring(0, index);
          if (filteredTreeData.findIndex((t: any) => t.code === str) === -1) {
            const obj = this.treeData.find(d => d.code === str);
            if (obj) {
              filteredTreeData.push(obj);
            }
          }
        }
      });
    } else {
      filteredTreeData = this.treeData;
    }

    const data = this.buildFileTree(filteredTreeData, '0');
    this.dataChange.next(data);
  }

  insertItem(parent: TreeItemNode, name: string) {
    if (parent.children) {
      parent.children.push({ item: name } as TreeItemNode);
      this.dataChange.next(this.data);
    }
  }

  updateItem(node: TreeItemNode, name: string) {
    node.item = name;
    this.dataChange.next(this.data);
  }
}


@Component({
  selector: 'app-new-practice',
  templateUrl: './new-practice.component.html',
  styleUrls: ['./new-practice.component.scss'],
  providers: [ChecklistDatabase]
})
export class NewPracticeComponent implements OnInit {

  treeData: any[] = [];

  flatNodeMap = new Map<TreeItemFlatNode, TreeItemNode>();
  nestedNodeMap = new Map<TreeItemNode, TreeItemFlatNode>();

  selectedParent: TreeItemFlatNode | null = null;
  newItemName = '';

  treeControl: FlatTreeControl<TreeItemFlatNode>;
  treeFlattener: MatTreeFlattener<TreeItemNode, TreeItemFlatNode>;
  dataSource: MatTreeFlatDataSource<TreeItemNode, TreeItemFlatNode>;

  checklistSelection = new SelectionModel<TreeItemFlatNode>(false /* multiple */);

  constructor(private database: ChecklistDatabase) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel,
      this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<TreeItemFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    database.dataChange.subscribe(data => {
      this.dataSource.data = data;
    });
  }

  ngOnInit(): void {
    const states = [
      {
        "id": "bb58",
        "state": "Madhya Pradesh",
        "cities": [
          {
            "name": "Indore",
            "files": [
              {
                "file": "Indore file1",
                "tableName": "indore_table1"
              },
              {
                "file": "Indore file2",
                "tableName": "indore_table2"
              }
            ]
          },
          {
            "name": "Bhopal",
            "files": [
              {
                "file": "Bhopal file1",
                "tableName": "bhopal_table1"
              }
            ]
          }
        ]
      },
      {
        "id": "bb59",
        "state": "Maharashtra",
        "cities": [
          {
            "name": "Mumbai",
            "files": [
              {
                "file": "Mumbai file1",
                "tableName": "mumbai_table1"
              }
            ]
          },
          {
            "name": "Pune",
            "files": [
              {
                "file": "Pune file1",
                "tableName": "pune_table1"
              }
            ]
          }
        ]
      }
    ];

    const treeData = this.convertToTreeData(states);
    this.treeData = treeData;
    this.database.initialize(this.treeData);
  }

  transformer = (node: TreeItemNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.item === node.item
      ? existingNode
      : new TreeItemFlatNode();
    flatNode.item = node.item;
    flatNode.level = level;
    flatNode.code = node.code;
    flatNode.tableName = node.tableName; // Add tableName here
    flatNode.expandable = node.children && node.children.length > 0;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }

  getLevel = (node: TreeItemFlatNode) => node.level;

  isExpandable = (node: TreeItemFlatNode) => node.expandable;

  getChildren = (node: TreeItemNode): TreeItemNode[] => node.children;

  hasChild = (_: number, _nodeData: TreeItemFlatNode) => _nodeData.expandable;

  hasNoContent = (_: number, _nodeData: TreeItemFlatNode) => _nodeData.item === '';

  addNewItem(node: TreeItemFlatNode) {
    const parentNode = this.flatNodeMap.get(node);
    this.database.insertItem(parentNode!, '');
    this.treeControl.expand(node);
  }

  saveNode(node: TreeItemFlatNode, itemValue: string) {
    const nestedNode = this.flatNodeMap.get(node);
    this.database.updateItem(nestedNode!, itemValue);
  }

  filterChanged(filterText: any) {
    const filterValue = filterText.value.toLowerCase();
    if (!filterValue) {
      this.database.initialize(this.treeData);
      return;
    }
  
    const filteredTreeData = this.treeData.map(state => {
      const stateMatch = state.text.toLowerCase().includes(filterValue);
      const cities = state.children || [];
      const filteredCities = cities.map((city:any) => {
        const cityMatch = city.text.toLowerCase().includes(filterValue);
        return {
          ...city,
          children: cityMatch ? city.files.map((file:any) => ({ text: file.file })) : []
        };
      }).filter((city:any) => city.text.toLowerCase().includes(filterValue) || city.children.length > 0);
  
      return {
        ...state,
        children: stateMatch ? cities.map((city:any) => ({
          ...city,
          children: city.files.map((file:any) => ({ text: file.file }))
        })) : filteredCities
      };
    }).filter(state => state.text.toLowerCase().includes(filterValue) || state.children.length > 0);
  
    this.database.initialize(filteredTreeData);
  }
  
  
  

  filterTreeData(filterText: string) {
    const filterTextLower = filterText.toLowerCase();
  
    const filterNodes = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map(node => {
        const filteredNode: TreeNode = { ...node };
  
        if (node.children) {
          const filteredChildren = filterNodes(node.children);
          if (filteredChildren.length > 0) {
            filteredNode.children = filteredChildren;
          } else if (node.item.toLowerCase().includes(filterTextLower)) {
            filteredNode.children = [];
          }
        }
  
        return filteredNode;
      }).filter(node => node.children && node.children.length > 0 || node.item.toLowerCase().includes(filterTextLower));
    };
  
    const filteredTreeData = filterNodes(this.treeData);
  
    this.database.initialize(filteredTreeData);
  }
  
  convertToTreeData(states: any): any[] {
    const treeData: any = [];

    states.forEach((state: any, stateIndex: number) => {
      const stateNode = {
        text: state.state,
        code: `0.${stateIndex + 1}`
      };
      treeData.push(stateNode);

      state.cities.forEach((city: any, cityIndex: number) => {
        const cityNode = {
          text: city.name,
          code: `${stateNode.code}.${cityIndex + 1}`
        };
        treeData.push(cityNode);

        city.files.forEach((file: any, fileIndex: number) => {
          const fileNode = {
            text: file.file,
            code: `${cityNode.code}.${fileIndex + 1}`,
            tableName: file.tableName
          };
          treeData.push(fileNode);
        });
      });
    });

    return treeData;
  }
  onCheckboxChange(event: any, node: any): void {
    console.log('Checkbox change event: ', event);
    console.log('Node: ', node);
  }
}
