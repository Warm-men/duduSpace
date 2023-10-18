import React from 'react';
import { createNavigator, GlobalTheme, NavigationRoute } from 'tuya-panel-kit';
import { StatusBar } from 'react-native';
import String from '@i18n';
import composeLayout from './composeLayout';
import { store } from './models';
import Home from './pages/home';
import Setting from './pages/setting';
import SmartSettings from './pages/smartSettings';
import CatLitterType from './pages/catLitterType';
import Notice from './pages/setting/notice';
import DryAgent from './pages/setting/dryAgent';
import UpperCover from './pages/introducePage/upperCover';
import RollerInstall from './pages/introducePage/rollerInstall';
import Roller from './pages/introducePage/roller';
import WarehouseStatus from './pages/warehouseStatus';
import CleaningReminder from './pages/cleaningReminder';
import ClearToiletReminder from './pages/clearToiletReminder';
import ScheduledCleaning from './pages/scheduledCleaning';
import ScheduledCleaningPlan from './pages/scheduledCleaning/addEditPlan';
import WeekWorkRecord from './pages/home/weekWorkRecord';

console.disableYellowBox = true;

const homePage = {
  background: {
    '0%': '#F6E3C9',
    '100%': '#F9F9F9',
  },
  // background: {
  //   '0%': '#FEFAF6',
  //   '100%': '#FEFAF6',
  // },
  topbarStyle: {
    backgroundColor: 'transparent',
  },
  hideTopbar: true,
};

const otherPage = {
  background: {
    '0%': '#FEFAF6',
    '100%': '#FEFAF6',
  },
  topbarStyle: {
    backgroundColor: 'transparent',
  },
};

const router: NavigationRoute[] = [
  {
    name: 'main',
    component: Home,
    options: {
      title: String.getLang('home_title'),
      renderStatusBar: () => <StatusBar barStyle="default" />,
      gestureEnabled: true,
    },
    ...homePage,
  },
  {
    name: 'smartSettings',
    component: SmartSettings,
    options: {
      title: String.getLang('smart_settings_title'),
      renderStatusBar: () => <StatusBar barStyle="default" />,
      ...otherPage,
      gestureEnabled: true,
    },
  },
  {
    name: 'catLitterType',
    component: CatLitterType,
    options: {
      title: ' ',
      renderStatusBar: () => <StatusBar barStyle="default" />,
      ...otherPage,
    },
  },
  {
    name: 'setting',
    component: Setting,
    options: {
      title: String.getLang('settings_title'),
      renderStatusBar: () => <StatusBar barStyle="default" />,
      ...otherPage,
      gestureEnabled: true,
    },
  },
  {
    name: 'notice',
    component: Notice,
    options: {
      title: String.getLang('notice_title'),
      renderStatusBar: () => <StatusBar barStyle="default" />,
      ...otherPage,
      gestureEnabled: true,
    },
  },
  {
    name: 'warehouseStatus',
    component: WarehouseStatus,
    options: {
      title: String.getLang('warehouse_title'),
      renderStatusBar: () => <StatusBar barStyle="default" />,
      ...otherPage,
      gestureEnabled: true,
    },
  },
  {
    name: 'cleaningReminder',
    component: CleaningReminder,
    options: {
      title: String.getLang('cleaning_reminder_title'),
      renderStatusBar: () => <StatusBar barStyle="default" />,
      ...otherPage,
      gestureEnabled: true,
    },
  },
  {
    name: 'clearToiletReminder',
    component: ClearToiletReminder,
    options: {
      title: String.getLang('clear_toilet_reminder_title'),
      renderStatusBar: () => <StatusBar barStyle="default" />,
      ...otherPage,
      gestureEnabled: true,
    },
  },
  {
    name: 'dryAgent',
    component: DryAgent,
    options: {
      title: String.getLang('desiccant_replacement_reminder'),
      renderStatusBar: () => <StatusBar barStyle="default" />,
      ...otherPage,
      gestureEnabled: true,
    },
  },
  {
    name: 'scheduledCleaning',
    component: ScheduledCleaning,
    options: {
      title: String.getLang('desiccant_replacement_reminder'),
      renderStatusBar: () => <StatusBar barStyle="default" />,
      ...otherPage,
      hideTopbar: true,
      gestureEnabled: true,
    },
  },
  {
    name: 'scheduledCleaningPlan',
    component: ScheduledCleaningPlan,
    options: {
      title: String.getLang('desiccant_replacement_reminder'),
      renderStatusBar: () => <StatusBar barStyle="default" />,
      ...otherPage,
      hideTopbar: true,
      gestureEnabled: true,
    },
  },
  {
    name: 'weekWorkRecord',
    component: WeekWorkRecord,
    options: {
      title: String.getLang('work_record'),
      renderStatusBar: () => <StatusBar barStyle="default" />,
      ...otherPage,
      gestureEnabled: true,
    },
  },
  {
    name: 'upperCover',
    component: UpperCover,
    options: {
      title: String.getLang('upper_cover_install'),
      renderStatusBar: () => <StatusBar barStyle="default" />,
      ...otherPage,
      gestureEnabled: true,
    },
  },
  {
    name: 'rollerInstall',
    component: RollerInstall,
    options: {
      title: String.getLang('roller_install'),
      renderStatusBar: () => <StatusBar barStyle="default" />,
      ...otherPage,
      gestureEnabled: true,
    },
  },
  {
    name: 'roller',
    component: Roller,
    options: {
      title: String.getLang('roller_title'),
      renderStatusBar: () => <StatusBar barStyle="default" />,
      ...otherPage,
      gestureEnabled: true,
    },
  },
];

interface Props {
  theme: GlobalTheme;
}

const Navigator = createNavigator<Props>({
  router,
  screenOptions: {},
});

export default composeLayout(store, Navigator);
