import TripFiltersView from '../view/trip-filters-view.js';
import {render, replace, remove} from '../render.js';
import {UpdateType, FilterType, RenderPosition} from '../consts.js';

export default class FilterPresenter {
    #filterContainer = null;
    #filterModel = null;
    #pointsModel = null;
    #filterComponent = null;

    constructor(filterContainer, filterModel, tasksModel) {
      this.#filterContainer = filterContainer;
      this.#filterModel = filterModel;
      this.#pointsModel = tasksModel;
    }

    get filters() {
      return ['everything', 'future', 'past'];
    }

    destroy = () => {
      remove(this.#filterComponent);
      this.#filterComponent = null;

      this.#pointsModel.removeObserver(this.#handleModelEvent);
      this.#filterModel.removeObserver(this.#handleModelEvent);
      this.#filterModel.setFilter(UpdateType.MAJOR, FilterType.EVERYTHING);
    };

    init = () => {
      const filters = this.filters;
      const prevFilterComponent = this.#filterComponent;

      this.#filterComponent = new TripFiltersView(filters, this.#filterModel.filter);
      this.#filterComponent.setFilterTypeChangeHandler(this.#handleFilterTypeChange);

      this.#pointsModel.addObserver(this.#handleModelEvent);
      this.#filterModel.addObserver(this.#handleModelEvent);

      if (prevFilterComponent === null) {
        render(this.#filterContainer, this.#filterComponent, RenderPosition.BEFOREEND);
        return;
      }

      replace(this.#filterComponent, prevFilterComponent);
      remove(prevFilterComponent);
    };

    #handleModelEvent = () => {
      this.init();
    };

    #handleFilterTypeChange = (filterType) => {
      if (this.#filterModel.filter === filterType) {
        return;
      }

      this.#filterModel.setFilter(UpdateType.MAJOR, filterType);
    };
}
