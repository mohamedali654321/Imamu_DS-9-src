import {
  Route,
  Routes,
} from '@angular/router';

import { environment } from '../../environments/environment';
import { i18nBreadcrumbResolver } from '../core/breadcrumbs/i18n-breadcrumb.resolver';
import { notifyInfoGuard } from '../core/coar-notify/notify-info/notify-info.guard';
import { feedbackGuard } from '../core/feedback/feedback.guard';
import { hasValue } from '../shared/empty.util';
import { AccessibilitySettingsComponent } from './accessibility-settings/accessibility-settings.component';
import { ThemedEndUserAgreementComponent } from './end-user-agreement/themed-end-user-agreement.component';
import { ThemedFeedbackComponent } from './feedback/themed-feedback.component';
import {
  ACCESSIBILITY_SETTINGS_PATH,
  COAR_NOTIFY_SUPPORT,
  END_USER_AGREEMENT_PATH,
  FEEDBACK_PATH,
  PRIVACY_PATH,
  HELP_PATH
} from './info-routing-paths';
import { NotifyInfoComponent } from './notify-info/notify-info.component';
import { ThemedPrivacyComponent } from './privacy/themed-privacy.component';
import { ThemedHelpComponent } from './help/themed-help.component';


export const ROUTES: Routes = [
  {
    path: FEEDBACK_PATH,
    component: ThemedFeedbackComponent,
    resolve: { breadcrumb: i18nBreadcrumbResolver },
    data: { title: 'info.feedback.title', breadcrumbKey: 'info.feedback' },
    canActivate: [feedbackGuard],
  },
  {
    path: ACCESSIBILITY_SETTINGS_PATH,
    component: AccessibilitySettingsComponent,
    resolve: { breadcrumb: i18nBreadcrumbResolver },
    data: { title: 'info.accessibility-settings.title', breadcrumbKey: 'info.accessibility-settings' },
  },
  environment.info.enableEndUserAgreement ? {
    path: END_USER_AGREEMENT_PATH,
    component: ThemedEndUserAgreementComponent,
    resolve: { breadcrumb: i18nBreadcrumbResolver },
    data: { title: 'info.end-user-agreement.title', breadcrumbKey: 'info.end-user-agreement' },
  } : undefined,
  environment.info.enablePrivacyStatement ? {
    path: PRIVACY_PATH,
    component: ThemedPrivacyComponent,
    resolve: { breadcrumb: i18nBreadcrumbResolver },
    data: { title: 'info.privacy.title', breadcrumbKey: 'info.privacy' },
  } : undefined,
  environment.info.enableCOARNotifySupport ? {
    path: COAR_NOTIFY_SUPPORT,
    component: NotifyInfoComponent,
    canActivate: [notifyInfoGuard],
    resolve: {
      breadcrumb: i18nBreadcrumbResolver,
    },
    data: {
      title: 'info.coar-notify-support.title',
      breadcrumbKey: 'info.coar-notify-support',
    },
  } : undefined,
    {
    path: HELP_PATH,
    component: ThemedHelpComponent,
    resolve: {
      breadcrumb: i18nBreadcrumbResolver,
    },
    data: {
      title: 'info.help.title',
      breadcrumbKey: 'info.help',
    },
  }
].filter((route: Route) => hasValue(route));
