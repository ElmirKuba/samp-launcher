import { Component, OnDestroy, OnInit } from '@angular/core';
import { MaintenanceCrossoverService } from '../../services/maintenance-crossover.service';

@Component({
  selector: 'app-maintenance-crossover',
  templateUrl: './maintenance-crossover.component.html',
  styleUrl: './maintenance-crossover.component.scss',
})
export class WorkingWithCrossoverComponent implements OnInit, OnDestroy {
  constructor(
    private MaintenanceCrossoverService: MaintenanceCrossoverService
  ) {}

  ngOnInit(): void {
    void this.MaintenanceCrossoverService.checkCrossoverStatusReady();
  }

  ngOnDestroy(): void {
    //
  }
}
