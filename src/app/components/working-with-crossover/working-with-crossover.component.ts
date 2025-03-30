import { Component, OnDestroy, OnInit } from '@angular/core';
import { WorkingWithCrossoverService } from '../../services/working-with-crossover.service';

@Component({
  selector: 'app-working-with-crossover',
  templateUrl: './working-with-crossover.component.html',
  styleUrl: './working-with-crossover.component.scss',
})
export class WorkingWithCrossoverComponent implements OnInit, OnDestroy {
  constructor(
    private workingWithCrossoverService: WorkingWithCrossoverService
  ) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {}
}
