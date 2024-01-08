import theme from './theme';
import dpCodes from './dpCodes';

const DRY_KEY = 'dryAgent';

const FEED_STATE = {
  standby: 'standby',
  feeding: 'feeding',
  done: 'done',
  failed: 'failed',
};

const TIMER_CONFIG = {
  is12Hours: false,
  loop: true,
};

export { dpCodes, theme, DRY_KEY, FEED_STATE, TIMER_CONFIG };
export * from './styles';
export * from './type';
