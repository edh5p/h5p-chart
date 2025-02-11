/*global H5P*/

/**
 * Graph Cake module
 * @external {jQuery} $ H5P.jQuery
 * @external {EventDispatcher} EventDispatcher H5P.EventDispatcher
 */
H5P.NDLAChart = (function ($, EventDispatcher) {

  /**
   * Initialize module.
   *
   * @class
   * @param {Object} params Behavior settings
   * @param {Number} id Content identification
   */
  function Chart(params) {
    var self = this;

    // Inheritance
    EventDispatcher.call(self);

    // Set params and filter data set to make sure it's valid
    self.params = params;
    if (self.params.listOfTypes) {
      Chart.filterData(self.params.listOfTypes);
    }
    else {
      self.params.listOfTypes = [];
    }

    // Add example/default behavior
    if (!self.params.listOfTypes.length) {
      self.params.listOfTypes = [
        {
          text: 'Cat',
          value: 4,
          color: '#fbb033',
          fontColor: '#000'
        },
        {
          text: 'Dog',
          value: 2,
          color: '#ADD8E6',
          fontColor: '#000'
        },
        {
          text: 'Mouse',
          value: 3,
          color: '#90EE90',
          fontColor: '#000'
        }
      ];
    }

    // Set the figure definition for screen readers if it doesn't exist
    if (!self.params.figureDefinition) {
      self.params.figureDefinition = "Chart";
    }

    // Keep track of type.
    self.type = getChartType(self.params.graphMode);
  }

  function getChartType(graphMode) {
    switch (graphMode) {
      case 'pieChart':
        return 'Pie';

      case 'barChart':
        return 'Bar';

      case 'extendedBarChart':
        return 'ExtendedBar';

      case 'lineChart':
        return 'Line';

      default:
        return 'Pie';
    }
  }
  // Inheritance
  Chart.prototype = Object.create(EventDispatcher.prototype);
  Chart.prototype.constructor = Chart;

  /**
   * Make sure the data set has set the required text and value properties.
   *
   * @param {Array} dataSet
   */
  Chart.filterData = function (dataSet) {
    // Cycle through data set
    for (var i = 0; i < dataSet.length; i++) {
      var row = dataSet[i];
      if (row.text === undefined || row.value === undefined) {
        // Remove invalid data
        dataSet.splice(i, 1);
        i--;
        continue;
      }

      row.text = row.text.trim();
      row.value = parseFloat(row.value);
      if (row.text === '' || isNaN(row.value)) {
        // Remove invalid data
        dataSet.splice(i, 1);
        i--;
        continue;
      }
    }
  };

  /**
   * Append field to wrapper.
   *
   * @param {H5P.jQuery} $container
   */
  Chart.prototype.attach = function ($container) {
    var self = this;

    // Create chart on first attach
    if (self.$wrapper === undefined) {
      self.$wrapper = $('<div/>', {
        'class': 'h5p-chart-chart h5p-chart-' + self.type.toLowerCase()
      });
      self.chart = new H5P.NDLAChart[self.type + 'Chart'](self.params, self.$wrapper);
    }

    // Prepare container
    self.$container = $container.html('').addClass('h5p-chart').append(self.$wrapper);

    const $defgroup = $('<div/>', {
      'class': 'hidden-but-read',
      'aria-label': self.params.figureDefinition,
      'role': 'img' // Using img here since support for figure is non-existent (Will they know the difference?)
    });

    // Add aria-labels for the data
    self.params.listOfTypes.forEach(function (type) {
      var ariaLabel = $('<div/>', {
        'class': 'hidden-but-read',
        'html': type.text + ': ' + type.value + ''
      });
      $defgroup.append(ariaLabel);
    });

    self.$container.append($defgroup);

    // Handle resizing
    self.on('resize', function () {
      if (!self.$container.is(':visible')) {
        return; // Only handle if visible
      }
      // Resize existing chart
      self.chart.resize();
    });
  };

  return Chart;
})(H5P.jQuery, H5P.EventDispatcher);
