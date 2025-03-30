import { Component, OnDestroy, OnInit } from '@angular/core';
import { WorkingWithCrossoverService } from '../../services/maintenance-crossover.service';

@Component({
  selector: 'app-maintenance-crossover',
  templateUrl: './maintenance-crossover.component.html',
  styleUrl: './maintenance-crossover.component.scss',
})
export class WorkingWithCrossoverComponent implements OnInit, OnDestroy {
  constructor(
    private workingWithCrossoverService: WorkingWithCrossoverService
  ) {}

  ngOnInit(): void {
    this.workingWithCrossoverService.checkCrossoverStatusReady();
  }

  ngOnDestroy(): void {
    //
  }
}
