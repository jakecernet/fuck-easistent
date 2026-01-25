import {
  Component,
  ElementRef,
  HostListener,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { ignoreElements } from 'rxjs';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  @ViewChildren('gradeCard') gradeCards!: QueryList<ElementRef>;

  private cursorOffsetX = 0;
  private cursorOffsetY = 0;

  parallaxInfos: ParallaxInfo[] = [];

  private firstTransform = true;

  ngOnInit() {
    this.parallaxInfos = this.generateRandomCards(12);
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.parallaxInfos.forEach((card) => {
      this.cursorOffsetX = (event.clientX - window.innerWidth / 2) / window.innerWidth;
      this.cursorOffsetY = (event.clientY - window.innerHeight / 2) / window.innerHeight;

      card.targetX = card.x * window.innerWidth - 150 - (this.cursorOffsetX * 50) / card.depth;
      card.targetY = card.y * window.innerHeight - 80 - (this.cursorOffsetY * 50) / card.depth;
    });
  }
  ngAfterViewInit() {
    this.animate();
  }

  animate = () => {
    if (this.firstTransform) {
      this.gradeCards.forEach((cardEl, i) => {
        let card = this.parallaxInfos[i];

        cardEl.nativeElement.style.transform = `translate(${card.currentX}px, ${card.currentY}px)`;
      });
      this.firstTransform = false;
    }
    this.gradeCards.forEach((cardEl, i) => {
      let card = this.parallaxInfos[i];
      card.currentX += (card.targetX - card.currentX) * 0.01;
      card.currentY += (card.targetY - card.currentY) * 0.01;

      cardEl.nativeElement.style.transform = `translate(${card.currentX}px, ${card.currentY}px)`;
    });
    requestAnimationFrame(this.animate);
  };

  generateRandomCards(n: number): ParallaxInfo[] {
    const result: ParallaxInfo[] = [];
    const existingPoints: { x: number; y: number }[] = [];

    function distance(x1: number, y1: number, x2: number, y2: number): number {
      const dx = x2 - x1;
      const dy = y2 - y1;
      return Math.sqrt(dx * dx + dy * dy);
    }

    let nsqrt = Math.floor(Math.sqrt(n));

    let depths = [];
    for (let count = 0; count < n; count++) {
      depths.push(0.8 * ((count + 1) / n) + 0.2);
    }

    for (let count = 0; count < n; count++) {
      let info = new ParallaxInfo();

      info.x = Math.random() * 0.2 - 0.1 + count / n;
      info.y = 0.05 + Math.random() * 0.2 - 0.1 + (count % nsqrt) / nsqrt;

      existingPoints.push({ x: info.x, y: info.y });

      info.currentX = info.x * window.innerWidth;
      info.currentY = info.y * window.innerHeight;
      info.targetX = info.currentX;
      info.targetY = info.currentY;

      let depthI = Math.floor(Math.random() * depths.length);

      info.depth = depths[depthI];
      depths.splice(depthI, 1);
      info.z_index = Math.floor(-info.depth * 10);

      const names = ['Zgodovina', 'Matematika', 'Angleščina', 'Slovenščina', 'Geografija'];
      const shortNames = ['ZGO', 'MAT', 'ANG', 'SLO', 'GEO'];

      const idx = Math.floor(Math.random() * names.length);
      info.name = names[idx];
      info.shortName = shortNames[idx];

      info.value = Math.floor(Math.random() * 5) + 1;

      result.push(info);
    }

    return result;
  }
}

class ParallaxInfo {
  currentX = 0;
  currentY = 0;
  x = 0.1;
  y = 0.15;

  targetX = 0;
  targetY = 0;

  depth = 1;
  z_index = -1;

  name: string = 'Zgodovina';
  shortName: string = 'ZGO';
  value: number = 5;
}
