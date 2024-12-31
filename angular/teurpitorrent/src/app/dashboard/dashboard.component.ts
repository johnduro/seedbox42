import { Component, Injector, Input } from '@angular/core';
import { DashboardFileListComponent } from '../dashboard-file-list/dashboard-file-list.component';
import { DashboardChartDonutComponent } from '../dashboard-chart-donut/dashboard-chart-donut.component';
import { DashboardChatComponent } from '../dashboard-chat/dashboard-chat.component';
import { SettingsService } from '../settings/settings.service';
import { Panel } from '../settings/settings';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  @Input() content: any[] = [];

  panels: Panel[] = [];
  fileNumberExhibit = 0;
  miniChatMessageLimit = 0;
  injectors: { [key: string]: Injector } = {};


  constructor(private settingsService: SettingsService) { }

  ngOnInit(): void {
    const settings = this.settingsService.getSettings().subscribe(settings => {
      this.panels = settings.data.dashboard.panels;
      this.fileNumberExhibit = settings.data.dashboard['file-number-exhibit'];
      this.miniChatMessageLimit = settings.data.dashboard['mini-chat-message-limit'];
      this.createInjectors();
    });
  }

  getComponent(template: string) {
    switch (template) {
      case 'dashboard-fileList':
        return DashboardFileListComponent;
      case 'dashboard-chart-donut':
        return DashboardChartDonutComponent;
      case 'dashboard-chat':
        return DashboardChatComponent;
      default:
        return null;
    }
  }

  createInjectors(): void {
    this.panels.forEach(panel => {
      this.injectors[panel.name] = Injector.create({
        providers: [{ provide: 'panel', useValue: panel }]
      });
    });
  }

  getInjector(panel: Panel): Injector {
    return this.injectors[panel.name];
  }
}
