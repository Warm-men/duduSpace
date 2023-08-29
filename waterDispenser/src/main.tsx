import React from 'react';
import { createNavigator, GlobalTheme, NavigationRoute, TransitionPresets } from 'tuya-panel-kit';
import { StatusBar } from 'react-native';
import String from '@i18n';
import composeLayout from './composeLayout';
import { store } from './models';
import Home from './pages/home';
import Setting from './pages/setting';
import SmartSettings from './pages/smartSettings';
import CatLitterType from './pages/catLitterType';
import Notice from './pages/setting/notice';
import FilterElement from './pages/setting/filterElement';
import DeviceWash from './pages/setting/deviceWash';
import WarehouseStatus from './pages/warehouseStatus';
import CleaningReminder from './pages/cleaningReminder';
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
  gestureEnabled: true,
};

const router: NavigationRoute[] = [
  {
    name: 'main',
    component: Home,
    options: {
      title: String.getLang('home_title'),
      renderStatusBar: () => <StatusBar barStyle="default" />,
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
    },
  },
  {
    name: 'notice',
    component: Notice,
    options: {
      title: String.getLang('notice_title'),
      renderStatusBar: () => <StatusBar barStyle="default" />,
      ...otherPage,
    },
  },
  {
    name: 'warehouseStatus',
    component: WarehouseStatus,
    options: {
      title: String.getLang('warehouse_title'),
      renderStatusBar: () => <StatusBar barStyle="default" />,
      ...otherPage,
    },
  },
  {
    name: 'cleaningReminder',
    component: CleaningReminder,
    options: {
      title: String.getLang('cleaning_reminder_title'),
      renderStatusBar: () => <StatusBar barStyle="default" />,
      ...otherPage,
    },
  },
  {
    name: 'filterElement',
    component: FilterElement,
    options: {
      title: String.getLang('filter_element'),
      renderStatusBar: () => <StatusBar barStyle="default" />,
      ...otherPage,
    },
  },
  {
    name: 'deviceWash',
    component: DeviceWash,
    options: {
      title: String.getLang('device_wash'),
      renderStatusBar: () => <StatusBar barStyle="default" />,
      ...otherPage,
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
    },
  },
  {
    name: 'weekWorkRecord',
    component: WeekWorkRecord,
    options: {
      title: String.getLang('work_record'),
      renderStatusBar: () => <StatusBar barStyle="default" />,
      ...otherPage,
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
