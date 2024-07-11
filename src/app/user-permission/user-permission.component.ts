import { Component, Inject } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { StateService } from '../state/state.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

interface StateNode {
  name: string;
  children?: StateNode[];
}

interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
}

@Component({
  selector: 'app-user-permission',
  templateUrl: './user-permission.component.html',
  styleUrls: ['./user-permission.component.scss']
})
export class UserPermissionComponent {
  private _transformer = (node: StateNode, level: number) => ({
    expandable: !!node.children && node.children.length > 0,
    name: node.name,
    level: level,
  });

  treeControl = new FlatTreeControl<FlatNode>(
    node => node.level,
    node => node.expandable
  );

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    node => node.level,
    node => node.expandable,
    node => node.children
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  checklistSelection = new SelectionModel<FlatNode>(true /* multiple */);

  constructor(
    private stateService: StateService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<UserPermissionComponent>
  ) {
    const treeData: StateNode[] = Object.keys(data.stateData).map((stateName: string) => ({
      name: stateName,
      children: Object.keys(data.stateData[stateName]).map((cityName: string) => ({
        name: cityName
      }))
    }));

    this.dataSource.data = treeData;
  }

  hasChild = (_: number, node: FlatNode) => node.expandable;

  getCheckedNodes() {
    const checkedNodes = this.checklistSelection.selected.reduce((result: any, node) => {
      const parent = this.getParentNode(node);
      if (parent) {
        if (!result[parent.name]) {
          result[parent.name] = [];
        }
        result[parent.name].push(node.name);
      }
      return result;
    }, {});

    const response = Object.entries(checkedNodes).reduce((acc, [state, cities]) => {
      acc[state] = cities;
      return acc;
  }, {} as any);
    

    this.stateService.shareDataWithUser(response, this.data).subscribe(() => {
      this.dialogRef.close();
    });
  }

  onCheckboxChange(event: any, node: FlatNode) {
    if (event.checked) {
      this.checklistSelection.select(node);

      // If a state is selected, select all its cities
      if (node.level === 0) {
        this.selectAllChildren(node);
      } else {
        // If a city is selected, select its parent state
        const parent = this.getParentNode(node);
        if (parent) {
          this.checklistSelection.select(parent);
        }
      }
    } else {
      this.checklistSelection.deselect(node);

      // If a state is deselected, deselect all its cities
      if (node.level === 0) {
        this.deselectAllChildren(node);
      } else {
        // If a city is deselected, check if the state has any selected cities left
        const parent = this.getParentNode(node);
        if (parent) {
          const descendants = this.treeControl.getDescendants(parent);
          const isAnyChildSelected = descendants.some(child => this.checklistSelection.isSelected(child));
          if (!isAnyChildSelected) {
            this.checklistSelection.deselect(parent);
          }
        }
      }
    }
  }

  selectAllChildren(node: FlatNode) {
    const descendants = this.treeControl.getDescendants(node);
    descendants.forEach(child => this.checklistSelection.select(child));
  }

  deselectAllChildren(node: FlatNode) {
    const descendants = this.treeControl.getDescendants(node);
    descendants.forEach(child => this.checklistSelection.deselect(child));
  }

  getParentNode(node: FlatNode): FlatNode | null {
    const currentLevel = this.treeControl.getLevel(node);
    if (currentLevel < 1) {
      return null;
    }

    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;
    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];
      if (this.treeControl.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }
}
