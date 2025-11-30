import { Component, Input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-file-display-rating',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './file-display-rating.component.html',
  styleUrl: './file-display-rating.component.scss'
})
export class FileDisplayRatingComponent {
  @Input({ required: true }) grade!: number;

  faStar = faStar;
  faStarRegular = faStarRegular;

  getStarIcons(): any[] {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      if (i < this.grade) {
        stars.push(this.faStar);
      } else {
        stars.push(this.faStarRegular);
      }
    }
    return stars;
  }
}
