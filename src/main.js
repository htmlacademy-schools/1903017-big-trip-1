import HeaderInfoView from './view/header-info-view.js';
import TripTabsView from './view/trip-tabs-view.js';
import StatsView from './view/stats-view.js';
import {render, remove} from './render.js';
import {MenuItem, RenderPosition} from './consts.js';
import PointsModel from './model/points-model.js';
import FilterModel from './model/filter-model.js';
import TripPresenter from './presenter/trip-presenter.js';
import FilterPresenter from './presenter/filter-presenter.js';
import Api from './api.js';

const AUTHORIZATION = 'Basic mk8w236sl22785i';
const END_POINT = 'https://16.ecmascript.pages.academy/big-trip';

const pageMainElement = document.querySelector('.page-body');
const headerMenu = pageMainElement.querySelector('.trip-main');
const tripControlsNavigationElement = document.querySelector('.trip-controls__navigation');
const tripControlsFiltersElement = document.querySelector('.trip-controls__filters');
tripControlsFiltersElement.classList.add('visually-hidden');

const api = new Api(END_POINT, AUTHORIZATION);
const pointsModel = new PointsModel(api);
const filterModel = new FilterModel();

const tripPresenter = new TripPresenter(pageMainElement, pointsModel, filterModel, api);
const filterPresenter = new FilterPresenter(tripControlsFiltersElement, filterModel, pointsModel);

const siteMenuComponent = new TripTabsView();

let mode = 'TABLE';
let statisticsComponent = null;

const handlePointNewFormClose = () => {
  siteMenuComponent.element.querySelector(`[data-menu-item=${MenuItem.TABLE}]`).classList.remove('visually-hidden');
  siteMenuComponent.element.querySelector(`[data-menu-item=${MenuItem.STATS}]`).classList.remove('visually-hidden');
};

const handleSiteMenuClick = (menuItem) => {
  switch (menuItem) {
    case MenuItem.TABLE:
      if (mode !== 'TABLE') {
        filterPresenter.init();
        tripPresenter.init().finally(() => {
          remove(statisticsComponent);
          mode = 'TABLE';
        });
      }
      break;

    case MenuItem.STATS:
      if (mode !== 'STATS') {
        filterPresenter.destroy();
        tripPresenter.destroy();
        statisticsComponent = new StatsView(pointsModel.points);
        render(pageMainElement, statisticsComponent, RenderPosition.BEFOREEND);
        mode = 'STATS';
      }
      break;
  }
};

filterPresenter.init();

tripPresenter.init().finally(() => {
  pointsModel.init().finally(() => {
    siteMenuComponent.setMenuClickHandler(handleSiteMenuClick);
    render(tripControlsNavigationElement, siteMenuComponent, RenderPosition.BEFOREEND);
    render(headerMenu, new HeaderInfoView().element, RenderPosition.AFTERBEGIN);
    tripControlsFiltersElement.classList.remove('visually-hidden');
  });
});

document.querySelector('.trip-main__event-add-btn').addEventListener('click', (evt) => {
  evt.target.disabled = true;
  evt.preventDefault();
  remove(statisticsComponent);
  filterPresenter.destroy();
  filterPresenter.init();
  tripPresenter.destroy();
  tripPresenter.init().finally(() => {
    tripPresenter.createPoint(handlePointNewFormClose);
    siteMenuComponent.element.querySelector(`[data-menu-item=${MenuItem.TABLE}]`).classList.add('visually-hidden');
    siteMenuComponent.element.querySelector(`[data-menu-item=${MenuItem.STATS}]`).classList.add('visually-hidden');
    mode = 'TABLE';
  });
});
