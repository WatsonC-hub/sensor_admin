L.BasemapControl = L.Control.extend({
  options: {
    position: 'bottomleft',
    layers: [],
  },

  onAdd: function (map) {
    this._map = map;
    this._currentIndex = 0;

    const container = L.DomUtil.create('div', 'leaflet-control-basemap');
    this._img = L.DomUtil.create('div', 'basemap-img', container);

    L.DomEvent.disableClickPropagation(container);

    this._switchMap = L.map(container, {
      zoomControl: false,
      attributionControl: false,
      minZoom: this._map.getMinZoom() - 3,
      maxZoom: this._map.getMaxZoom() - 3,
      crs: this._map.options.crs,
      dragging: false,
      touchZoom: false,
      doubleClickZoom: false,
      scrollWheelZoom: false,
    });

    const options = this.options.layers[this._currentIndex].layer.options;

    // strip out zoomlevels and zoomOffset
    delete options.zoomOffset;
    delete options.zoomLevels;
    delete options.maxZoom;
    delete options.minZoom;
    delete options.tileSize;

    this._switchLayer = L.tileLayer(this.options.layers[this._currentIndex].layer._url, {
      ...options,
    }).addTo(this._switchMap);

    this._setLayer(this.options.layers[this._currentIndex].layer);

    L.DomEvent.on(this._img, 'click', this._nextLayer, this);

    this._map.on('moveend zoomend', this._updatePreview, this);

    this._initializePreview();

    return container;
  },

  _initializePreview: function () {
    setTimeout(() => {
      this._updatePreview();
    }, 100);
  },

  _setLayer: function (layer) {
    if (this._currentLayer) {
      this._map.removeLayer(this._currentLayer);
    }

    this._currentLayer = layer.addTo(this._map);
  },

  _nextLayer: function () {
    this._currentIndex = (this._currentIndex + 1) % this.options.layers.length;
    this._setLayer(this.options.layers[this._currentIndex].layer);

    this._updatePreview();

    this._map.fire('basemapChange', {
      layer: this.options.layers[this._currentIndex].layer,
    });
  },

  _updatePreview: function () {
    if (this._map) {
      const center = this._map.getCenter();
      const zoom = this._map.getZoom();

      const previewZoom = Math.max(zoom - 3, 0);

      this._switchMap.setView(center, previewZoom);

      const nextIndex = (this._currentIndex + 1) % this.options.layers.length;
      const nextLayer = this.options.layers[nextIndex].layer;

      const options = this.options.layers[this._currentIndex].layer.options;

      // strip out zoomlevels and zoomOffset
      delete options.zoomOffset;
      delete options.zoomLevels;
      delete options.maxZoom;
      delete options.minZoom;
      delete options.tileSize;

      let specificUrl = nextLayer._url.replace('{s}', 'a');

      Object.entries(nextLayer.options).forEach(([key, value]) => {
        specificUrl = specificUrl.replace(`{${key}}`, value);
      });

      this._switchLayer.setUrl(specificUrl);

      this._switchLayer.once('load', () => {
        this._img.style.backgroundImage = `url(${specificUrl})`;
        this._img.classList.remove('loading');
      });

      this._switchLayer.once('error', () => {
        this._img.classList.add('loading');
      });
    }
  },

  changeBasemap: function (index) {
    if (index >= 0 && index < this.options.layers.length) {
      this._currentIndex = index;
      this._setLayer(this.options.layers[this._currentIndex].layer);
      this._updatePreview();
    }
  },
});

L.basemapControl = function (options) {
  return new L.BasemapControl(options);
};
