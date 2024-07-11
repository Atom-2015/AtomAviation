import { Component, OnInit } from '@angular/core';
// import { mapboxgl }from 'mapbox-gl';
import * as mapboxgl from 'mapbox-gl';
// import * as MapboxDarw from '@mapbox/mapbox-gl-draw'
import * as MapboxDraw from '@mapbox/mapbox-gl-draw';
import * as turf from '@turf/turf';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor() {
  }

  ngOnInit(): void {
  }
  title = 'angular-project';
}
