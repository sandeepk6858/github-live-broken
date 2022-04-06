window.theme = window.theme || {};

/* ================ SLATE ================ */
window.theme = window.theme || {};

theme.Sections = function Sections() {
  this.constructors = {};
  this.instances = [];

  $(document)
    .on('shopify:section:load', this._onSectionLoad.bind(this))
    .on('shopify:section:unload', this._onSectionUnload.bind(this))
    .on('shopify:section:select', this._onSelect.bind(this))
    .on('shopify:section:deselect', this._onDeselect.bind(this))
    .on('shopify:block:select', this._onBlockSelect.bind(this))
    .on('shopify:block:deselect', this._onBlockDeselect.bind(this));
};

theme.Sections.prototype = _.assignIn({}, theme.Sections.prototype, {
  _createInstance: function(container, constructor) {
    var $container = $(container);
    var id = $container.attr('data-section-id');
    var type = $container.attr('data-section-type');

    constructor = constructor || this.constructors[type];

    if (_.isUndefined(constructor)) {
      return;
    }

    var instance = _.assignIn(new constructor(container), {
      id: id,
      type: type,
      container: container
    });

    this.instances.push(instance);
  },

  _onSectionLoad: function(evt) {
    var container = $('[data-section-id]', evt.target)[0];
    if (container) {
      this._createInstance(container);
    }
  },

  _onSectionUnload: function(evt) {
    this.instances = _.filter(this.instances, function(instance) {
      var isEventInstance = instance.id === evt.detail.sectionId;

      if (isEventInstance) {
        if (_.isFunction(instance.onUnload)) {
          instance.onUnload(evt);
        }
      }

      return !isEventInstance;
    });
  },

  _onSelect: function(evt) {
    // eslint-disable-next-line no-shadow
    var instance = _.find(this.instances, function(instance) {
      return instance.id === evt.detail.sectionId;
    });

    if (!_.isUndefined(instance) && _.isFunction(instance.onSelect)) {
      instance.onSelect(evt);
    }
  },

  _onDeselect: function(evt) {
    // eslint-disable-next-line no-shadow
    var instance = _.find(this.instances, function(instance) {
      return instance.id === evt.detail.sectionId;
    });

    if (!_.isUndefined(instance) && _.isFunction(instance.onDeselect)) {
      instance.onDeselect(evt);
    }
  },

  _onBlockSelect: function(evt) {
    // eslint-disable-next-line no-shadow
    var instance = _.find(this.instances, function(instance) {
      return instance.id === evt.detail.sectionId;
    });

    if (!_.isUndefined(instance) && _.isFunction(instance.onBlockSelect)) {
      instance.onBlockSelect(evt);
    }
  },

  _onBlockDeselect: function(evt) {
    // eslint-disable-next-line no-shadow
    var instance = _.find(this.instances, function(instance) {
      return instance.id === evt.detail.sectionId;
    });

    if (!_.isUndefined(instance) && _.isFunction(instance.onBlockDeselect)) {
      instance.onBlockDeselect(evt);
    }
  },

  register: function(type, constructor) {
    this.constructors[type] = constructor;

    $('[data-section-type=' + type + ']').each(
      function(index, container) {
        this._createInstance(container, constructor);
      }.bind(this)
    );
  }
});

window.slate = window.slate || {};

/**
 * iFrames
 * -----------------------------------------------------------------------------
 * Wrap videos in div to force responsive layout.
 *
 * @namespace iframes
 */

slate.rte = {
  /**
   * Wrap tables in a container div to make them scrollable when needed
   *
   * @param {object} options - Options to be used
   * @param {jquery} options.$tables - jquery object(s) of the table(s) to wrap
   * @param {string} options.tableWrapperClass - table wrapper class name
   */
  wrapTable: function(options) {
    options.$tables.wrap(
      '<div class="' + options.tableWrapperClass + '"></div>'
    );
  },

  /**
   * Wrap iframes in a container div to make them responsive
   *
   * @param {object} options - Options to be used
   * @param {jquery} options.$iframes - jquery object(s) of the iframe(s) to wrap
   * @param {string} options.iframeWrapperClass - class name used on the wrapping div
   */
  wrapIframe: function(options) {
    options.$iframes.each(function() {
      // Add wrapper to make video responsive
      $(this).wrap('<div class="' + options.iframeWrapperClass + '"></div>');

      // Re-set the src attribute on each iframe after page load
      // for Chrome's "incorrect iFrame content on 'back'" bug.
      // https://code.google.com/p/chromium/issues/detail?id=395791
      // Need to specifically target video and admin bar
      this.src = this.src;
    });
  }
};

window.slate = window.slate || {};

/**
 * A11y Helpers
 * -----------------------------------------------------------------------------
 * A collection of useful functions that help make your theme more accessible
 * to users with visual impairments.
 *
 *
 * @namespace a11y
 */

slate.a11y = {
  /**
   * For use when focus shifts to a container rather than a link
   * eg for In-page links, after scroll, focus shifts to content area so that
   * next `tab` is where user expects if focusing a link, just $link.focus();
   *
   * @param {JQuery} $element - The element to be acted upon
   */
  pageLinkFocus: function($element) {
    var focusClass = 'js-focus-hidden';

    $element
      .first()
      .attr('tabIndex', '-1')
      .focus()
      .addClass(focusClass)
      .one('blur', callback);

    function callback() {
      $element
        .first()
        .removeClass(focusClass)
        .removeAttr('tabindex');
    }
  },

  /**
   * If there's a hash in the url, focus the appropriate element
   */
  focusHash: function() {
    var hash = window.location.hash;

    // is there a hash in the url? is it an element on the page?
    if (hash && document.getElementById(hash.slice(1))) {
      this.pageLinkFocus($(hash));
    }
  },

  /**
   * When an in-page (url w/hash) link is clicked, focus the appropriate element
   */
  bindInPageLinks: function() {
    $('a[href*=#]').on(
      'click',
      function(evt) {
        this.pageLinkFocus($(evt.currentTarget.hash));
      }.bind(this)
    );
  },

  /**
   * Traps the focus in a particular container
   *
   * @param {object} options - Options to be used
   * @param {jQuery} options.$container - Container to trap focus within
   * @param {jQuery} options.$elementToFocus - Element to be focused when focus leaves container
   * @param {string} options.namespace - Namespace used for new focus event handler
   */
  trapFocus: function(options) {
    var eventName = options.namespace
      ? 'focusin.' + options.namespace
      : 'focusin';

    if (!options.$elementToFocus) {
      options.$elementToFocus = options.$container;
    }

    options.$container.attr('tabindex', '-1');
    options.$elementToFocus.focus();

    $(document).off('focusin');

    $(document).on(eventName, function(evt) {
      if (
        options.$container[0] !== evt.target &&
        !options.$container.has(evt.target).length
      ) {
        options.$container.focus();
      }
    });
  },

  /**
   * Removes the trap of focus in a particular container
   *
   * @param {object} options - Options to be used
   * @param {jQuery} options.$container - Container to trap focus within
   * @param {string} options.namespace - Namespace used for new focus event handler
   */
  removeTrapFocus: function(options) {
    var eventName = options.namespace
      ? 'focusin.' + options.namespace
      : 'focusin';

    if (options.$container && options.$container.length) {
      options.$container.removeAttr('tabindex');
    }

    $(document).off(eventName);
  }
};

/**
 * Image Helper Functions
 * -----------------------------------------------------------------------------
 * A collection of functions that help with basic image operations.
 *
 */

theme.Images = (function() {
  /**
   * Preloads an image in memory and uses the browsers cache to store it until needed.
   *
   * @param {Array} images - A list of image urls
   * @param {String} size - A shopify image size attribute
   */

  function preload(images, size) {
    if (typeof images === 'string') {
      images = [images];
    }

    for (var i = 0; i < images.length; i++) {
      var image = images[i];
      this.loadImage(this.getSizedImageUrl(image, size));
    }
  }

  /**
   * Loads and caches an image in the browsers cache.
   * @param {string} path - An image url
   */
  function loadImage(path) {
    new Image().src = path;
  }

  /**
   * Swaps the src of an image for another OR returns the imageURL to the callback function
   * @param image
   * @param element
   * @param callback
   */
  function switchImage(image, element, callback) {
    var size = this.imageSize(element.src);
    var imageUrl = this.getSizedImageUrl(image.src, size);

    if (callback) {
      callback(imageUrl, image, element); // eslint-disable-line callback-return
    } else {
      element.src = imageUrl;
    }
  }

  /**
   * +++ Useful
   * Find the Shopify image attribute size
   *
   * @param {string} src
   * @returns {null}
   */
  function imageSize(src) {
    var match = src.match(
      /.+_((?:pico|icon|thumb|small|compact|medium|large|grande)|\d{1,4}x\d{0,4}|x\d{1,4})[_\\.@]/
    );

    if (match !== null) {
      if (match[2] !== undefined) {
        return match[1] + match[2];
      } else {
        return match[1];
      }
    } else {
      return null;
    }
  }

  /**
   * +++ Useful
   * Adds a Shopify size attribute to a URL
   *
   * @param src
   * @param size
   * @returns {*}
   */
  function getSizedImageUrl(src, size) {
    if (size === null) {
      return src;
    }

    if (size === 'master') {
      return this.removeProtocol(src);
    }

    var match = src.match(
      /\.(jpg|jpeg|gif|png|bmp|bitmap|tiff|tif)(\?v=\d+)?$/i
    );

    if (match !== null) {
      var prefix = src.split(match[0]);
      var suffix = match[0];

      return this.removeProtocol(prefix[0] + '_' + size + suffix);
    }

    return null;
  }

  function removeProtocol(path) {
    return path.replace(/http(s)?:/, '');
  }

  return {
    preload: preload,
    loadImage: loadImage,
    switchImage: switchImage,
    imageSize: imageSize,
    getSizedImageUrl: getSizedImageUrl,
    removeProtocol: removeProtocol
  };
})();

/**
 * Currency Helpers
 * -----------------------------------------------------------------------------
 * A collection of useful functions that help with currency formatting
 *
 * Current contents
 * - formatMoney - Takes an amount in cents and returns it as a formatted dollar value.
 *
 * Alternatives
 * - Accounting.js - http://openexchangerates.github.io/accounting.js/
 *
 */

theme.Currency = (function() {
  var moneyFormat = '$'; // eslint-disable-line camelcase

  function formatMoney(cents, format) {
    if (typeof cents === 'string') {
      cents = cents.replace('.', '');
    }
    var value = '';
    var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    var formatString = format || moneyFormat;

    function formatWithDelimiters(number, precision, thousands, decimal) {
      thousands = thousands || ',';
      decimal = decimal || '.';

      if (isNaN(number) || number === null) {
        return 0;
      }

      number = (number / 100.0).toFixed(precision);

      var parts = number.split('.');
      var dollarsAmount = parts[0].replace(
        /(\d)(?=(\d\d\d)+(?!\d))/g,
        '$1' + thousands
      );
      // var centsAmount = parts[1] ? decimal + parts[1] : '';

      // return dollarsAmount + centsAmount;
      return dollarsAmount;
    }

    switch (formatString.match(placeholderRegex)[1]) {
      case 'amount':
        value = formatWithDelimiters(cents, 2);
        break;
      case 'amount_no_decimals':
        value = formatWithDelimiters(cents, 0);
        break;
      case 'amount_with_comma_separator':
        value = formatWithDelimiters(cents, 2, '.', ',');
        break;
      case 'amount_no_decimals_with_comma_separator':
        value = formatWithDelimiters(cents, 0, '.', ',');
        break;
      case 'amount_no_decimals_with_space_separator':
        value = formatWithDelimiters(cents, 0, ' ');
        break;
      case 'amount_with_apostrophe_separator':
        value = formatWithDelimiters(cents, 2, "'");
        break;
    }

    return formatString.replace(placeholderRegex, value);
  }

  return {
    formatMoney: formatMoney
  };
})();

/**
 * Variant Selection scripts
 * ------------------------------------------------------------------------------
 *
 * Handles change events from the variant inputs in any `cart/add` forms that may
 * exist.  Also updates the master select and triggers updates when the variants
 * price or image changes.
 *
 * @namespace variants
 */

slate.Variants = (function() {
  /**
   * Variant constructor
   *
   * @param {object} options - Settings from `product.js`
   */
  function Variants(options) {
    this.$container = options.$container;
    this.product = options.product;
    this.singleOptionSelector = options.singleOptionSelector;
    this.originalSelectorId = options.originalSelectorId;
    this.enableHistoryState = options.enableHistoryState;
    this.currentVariant = this._getVariantFromOptions();

    $(this.singleOptionSelector, this.$container).on(
      'change',
      this._onSelectChange.bind(this)
    );
  }

  Variants.prototype = _.assignIn({}, Variants.prototype, {
    /**
     * Get the currently selected options from add-to-cart form. Works with all
     * form input elements.
     *
     * @return {array} options - Values of currently selected variants
     */
    _getCurrentOptions: function() {
      var currentOptions = _.map(
        $(this.singleOptionSelector, this.$container),
        function(element) {
          var $element = $(element);
          var type = $element.attr('type');
          var currentOption = {};

          if (type === 'radio' || type === 'checkbox') {
            if ($element[0].checked) {
              currentOption.value = $element.val();
              currentOption.index = $element.data('index');

              return currentOption;
            } else {
              return false;
            }
          } else {
            currentOption.value = $element.val();
            currentOption.index = $element.data('index');

            return currentOption;
          }
        }
      );

      // remove any unchecked input values if using radio buttons or checkboxes
      currentOptions = _.compact(currentOptions);

      return currentOptions;
    },

    /**
     * Find variant based on selected values.
     *
     * @param  {array} selectedValues - Values of variant inputs
     * @return {object || undefined} found - Variant object from product.variants
     */
    _getVariantFromOptions: function() {
      var selectedValues = this._getCurrentOptions();
      var variants = this.product.variants;

      var found = _.find(variants, function(variant) {
        return selectedValues.every(function(values) {
          return _.isEqual(variant[values.index], values.value);
        });
      });

      return found;
    },

    /**
     * Event handler for when a variant input changes.
     */
    _onSelectChange: function() {
      var variant = this._getVariantFromOptions();

      this.$container.trigger({
        type: 'variantChange',
        variant: variant
      });

      if (!variant) {
        return;
      }

      this._updateMasterSelect(variant);
      this._updateImages(variant);
      this._updatePrice(variant);
      this._updateSKU(variant);
      this.currentVariant = variant;
	  this._updateAttribute(variant);
      if (this.enableHistoryState) {
        this._updateHistoryState(variant);
      }
    },

    /**
     * Trigger event when variant image changes
     *
     * @param  {object} variant - Currently selected variant
     * @return {event}  variantImageChange
     */
    _updateImages: function(variant) {
      var variantImage = variant.featured_image || {};
      var currentVariantImage = this.currentVariant.featured_image || {};

      if (
        !variant.featured_image ||
        variantImage.src === currentVariantImage.src
      ) {
        return;
      }

      this.$container.trigger({
        type: 'variantImageChange',
        variant: variant
      });
    },

    /**
     * Trigger event when variant price changes.
     *
     * @param  {object} variant - Currently selected variant
     * @return {event} variantPriceChange
     */
    _updatePrice: function(variant) {
      if (
        variant.price === this.currentVariant.price &&
        variant.compare_at_price === this.currentVariant.compare_at_price
      ) {
        return;
      }

      this.$container.trigger({
        type: 'variantPriceChange',
        variant: variant
      });


      // CODE FOR AFFIRM JS
      affirm.ui.ready(
        function() {
          $('.affirm-as-low-as').attr('data-amount', variant.price);
          affirm.ui.refresh();
        }
      );
    },

    /**
     * Trigger event when variant sku changes.
     *
     * @param  {object} variant - Currently selected variant
     * @return {event} variantSKUChange
     */
    _updateSKU: function(variant) {
      if (variant.sku === this.currentVariant.sku) {
        return;
      }

      this.$container.trigger({
        type: 'variantSKUChange',
        variant: variant
      });
    },


    /* update product attribute table base to the active variant */
    _updateAttribute: function(variant) {
     	// tabs - product details & ships in - delivery date
        if ( typeof variantMetafields[variant.id] != "undefined" )
        {
            //console.log(variantMetafields[variant.id]);
            ships_in = variantMetafields[variant.id].ships_in;
          	tableList = '<table class="product-attribute" >';
        	listVariant = variantMetafields[variant.id];
            fields = attrFields.split(',');
            for ( k=0;k<fields.length;k++) {
                field = fields[k];
                title = field.replace('_',' ').replace('_',' ').replace('2','');
				//console.log(title);
				if ( typeof listVariant[field] != 'undefined' ){
					if(title == "ships in"){
						title = title.replace("ships in", "Production Time");
						tableList += "<tr><td style='background: #f3f3f3;width: 215px; text-transform: capitalize' >" + title + "</td><td class='tdcontent update_custom_proudction_time'>" + listVariant[field] +  " Days</td></tr>";
					}else{
						tableList += "<tr><td style='background: #f3f3f3;width: 215px; text-transform: capitalize' >" + title + "</td><td class='tdcontent'>" + listVariant[field] +  "</td></tr>";
					}
                    
				}
            }
            tableList += "</table>";
            $(".content-tab1").html(tableList);
            $(".ships_in_new").html("<span>Ships in <span class='default-day" + ships_in + "'>1 - </span>" + ships_in +  " days</span>");

            //var now = new Date();
            //now.setDate(now.getDate() + + ships_in);

            var date = new Date();
            var nextDate = date.getDate() + + ships_in;
            date.setDate(nextDate);
            var newDate = date.toUTCString();
            newDate = newDate.split(' ').slice(0, 4).join(' ');
          //  console.log(newDate);
            $(".js-inputships-new").val(newDate);
        }

    },


    /**
     * Update history state for product deeplinking
     *
     * @param  {variant} variant - Currently selected variant
     * @return {k}         [description]
     */
    _updateHistoryState: function(variant) {
      if (!history.replaceState || !variant) {
        return;
      }

      var newurl =
        window.location.protocol +
        '//' +
        window.location.host +
        window.location.pathname +
        '?variant=' +
        variant.id;
      window.history.replaceState({ path: newurl }, '', newurl);
    },

    /**
     * Update hidden master select of variant change
     *
     * @param  {variant} variant - Currently selected variant
     */
    _updateMasterSelect: function(variant) {
      $(this.originalSelectorId, this.$container).val(variant.id);
    }
  });

  return Variants;
})();


/* ================ GLOBAL ================ */
/*============================================================================
  Drawer modules
==============================================================================*/
theme.Drawers = (function() {
  function Drawer(id, position, options) {
    var defaults = {
      close: '.js-drawer-close',
      open: '.js-drawer-open-' + position,
      openClass: 'js-drawer-open',
      dirOpenClass: 'js-drawer-open-' + position
    };

    this.nodes = {
      $parent: $('html').add('body'),
      $page: $('#PageContainer')
    };

    this.config = $.extend(defaults, options);
    this.position = position;

    this.$drawer = $('#' + id);

    if (!this.$drawer.length) {
      return false;
    }

    this.drawerIsOpen = false;
    this.init();
  }

  Drawer.prototype.init = function() {
    $(this.config.open).on('click', $.proxy(this.open, this));
    this.$drawer.on('click', this.config.close, $.proxy(this.close, this));
  };

  Drawer.prototype.open = function(evt) {
    // Keep track if drawer was opened from a click, or called by another function
    var externalCall = false;

    // Prevent following href if link is clicked
    if (evt) {
      evt.preventDefault();
    } else {
      externalCall = true;
    }

    // Without this, the drawer opens, the click event bubbles up to nodes.$page
    // which closes the drawer.
    if (evt && evt.stopPropagation) {
      evt.stopPropagation();
      // save the source of the click, we'll focus to this on close
      this.$activeSource = $(evt.currentTarget);
    }

    if (this.drawerIsOpen && !externalCall) {
      return this.close();
    }

    // Add is-transitioning class to moved elements on open so drawer can have
    // transition for close animation
    this.$drawer.prepareTransition();

    this.nodes.$parent.addClass(
      this.config.openClass + ' ' + this.config.dirOpenClass
    );
    this.drawerIsOpen = true;

    // Set focus on drawer
    slate.a11y.trapFocus({
      $container: this.$drawer,
      namespace: 'drawer_focus'
    });

    // Run function when draw opens if set
    if (
      this.config.onDrawerOpen &&
      typeof this.config.onDrawerOpen === 'function'
    ) {
      if (!externalCall) {
        this.config.onDrawerOpen();
      }
    }

    if (this.$activeSource && this.$activeSource.attr('aria-expanded')) {
      this.$activeSource.attr('aria-expanded', 'true');
    }

    this.bindEvents();

    return this;
  };

  Drawer.prototype.close = function() {
    if (!this.drawerIsOpen) {
      // don't close a closed drawer
      return;
    }

    // deselect any focused form elements
    $(document.activeElement).trigger('blur');

    // Ensure closing transition is applied to moved elements, like the nav
    this.$drawer.prepareTransition();

    this.nodes.$parent.removeClass(
      this.config.dirOpenClass + ' ' + this.config.openClass
    );

    this.drawerIsOpen = false;

    // Remove focus on drawer
    slate.a11y.removeTrapFocus({
      $container: this.$drawer,
      namespace: 'drawer_focus'
    });

    this.unbindEvents();
  };

  Drawer.prototype.bindEvents = function() {
    this.nodes.$parent.on(
      'keyup.drawer',
      $.proxy(function(evt) {
        // close on 'esc' keypress
        if (evt.keyCode === 27) {
          this.close();
          return false;
        } else {
          return true;
        }
      }, this)
    );

    // Lock scrolling on mobile
    this.nodes.$page.on('touchmove.drawer', function() {
      return false;
    });

    this.nodes.$page.on(
      'click.drawer',
      $.proxy(function() {
        this.close();
        return false;
      }, this)
    );
  };

  Drawer.prototype.unbindEvents = function() {
    this.nodes.$page.off('.drawer');
    this.nodes.$parent.off('.drawer');
  };

  return Drawer;
})();


/* ================ MODULES ================ */
window.theme = window.theme || {};

theme.Header = (function() {
  var selectors = {
    body: 'body',
    navigation: '#AccessibleNav',
    siteNavHasDropdown: '.site-nav--has-dropdown',
    siteNavChildLinks: '.site-nav__child-link',
    siteNavActiveDropdown: '.site-nav--active-dropdown',
    siteNavLinkMain: '.site-nav__link--main',
    siteNavChildLink: '.site-nav__link--last'
  };

  var config = {
    activeClass: 'site-nav--active-dropdown',
    childLinkClass: 'site-nav__child-link'
  };

  var cache = {};

  function init() {
    cacheSelectors();

    cache.$parents.on('click.siteNav', function(evt) {
      var $el = $(this);

      if (!$el.hasClass(config.activeClass)) {
        // force stop the click from happening
        evt.preventDefault();
        evt.stopImmediatePropagation();
      }

      showDropdown($el);
    });

    // check when we're leaving a dropdown and close the active dropdown
    $(selectors.siteNavChildLink).on('focusout.siteNav', function() {
      setTimeout(function() {
        if (
          $(document.activeElement).hasClass(config.childLinkClass) ||
          !cache.$activeDropdown.length
        ) {
          return;
        }

        hideDropdown(cache.$activeDropdown);
      });
    });

    // close dropdowns when on top level nav
    cache.$topLevel.on('focus.siteNav', function() {
      if (cache.$activeDropdown.length) {
        hideDropdown(cache.$activeDropdown);
      }
    });

    cache.$subMenuLinks.on('click.siteNav', function(evt) {
      // Prevent click on body from firing instead of link
      evt.stopImmediatePropagation();
    });
  }

  function cacheSelectors() {
    cache = {
      $nav: $(selectors.navigation),
      $topLevel: $(selectors.siteNavLinkMain),
      $parents: $(selectors.navigation).find(selectors.siteNavHasDropdown),
      $subMenuLinks: $(selectors.siteNavChildLinks),
      $activeDropdown: $(selectors.siteNavActiveDropdown)
    };
  }

  function showDropdown($el) {
    $el.addClass(config.activeClass);

    // close open dropdowns
    if (cache.$activeDropdown.length) {
      hideDropdown(cache.$activeDropdown);
    }

    cache.$activeDropdown = $el;

    // set expanded on open dropdown
    $el.find(selectors.siteNavLinkMain).attr('aria-expanded', 'true');

    setTimeout(function() {
      $(window).on('keyup.siteNav', function(evt) {
        if (evt.keyCode === 27) {
          hideDropdown($el);
        }
      });

      $(selectors.body).on('click.siteNav', function() {
        hideDropdown($el);
      });
    }, 250);
  }

  function hideDropdown($el) {
    // remove aria on open dropdown
    $el.find(selectors.siteNavLinkMain).attr('aria-expanded', 'false');
    $el.removeClass(config.activeClass);

    // reset active dropdown
    cache.$activeDropdown = $(selectors.siteNavActiveDropdown);

    $(selectors.body).off('click.siteNav');
    $(window).off('keyup.siteNav');
  }

  function unload() {
    $(window).off('.siteNav');
    cache.$parents.off('.siteNav');
    cache.$subMenuLinks.off('.siteNav');
    cache.$topLevel.off('.siteNav');
    $(selectors.siteNavChildLink).off('.siteNav');
    $(selectors.body).off('.siteNav');
  }

  return {
    init: init, cartUpdateCallback: (typeof cartUpdateCallback !== 'undefined' ? cartUpdateCallback : null),
    unload: unload
  };
})();

window.theme = window.theme || {};

theme.MobileNav = (function() {
  var classes = {
    mobileNavOpenIcon: 'mobile-nav--open',
    mobileNavCloseIcon: 'mobile-nav--close',
    navLinkWrapper: 'mobile-nav__item',
    navLink: 'mobile-nav__link',
    subNavLink: 'mobile-nav__sublist-link',
    return: 'mobile-nav__return-btn',
    subNavActive: 'is-active',
    subNavClosing: 'is-closing',
    navOpen: 'js-menu--is-open',
    subNavShowing: 'sub-nav--is-open',
    thirdNavShowing: 'third-nav--is-open',
    subNavToggleBtn: 'js-toggle-submenu',
  };
  var cache = {};
  var isTransitioning;
  var $activeSubNav;
  var $activeTrigger;
  var menuLevel = 1;
  // Breakpoints from src/stylesheets/global/variables.scss.liquid
  var mediaQuerySmall = 'screen and (max-width: 749px)';

  function init() {
    cacheSelectors();

    cache.$mobileNavToggle.on('click', toggleMobileNav);
    cache.$subNavToggleBtn.on('click.subNav', toggleSubNav);

    // Close mobile nav when unmatching mobile breakpoint
    enquire.register(mediaQuerySmall, {
      unmatch: function() {
        closeMobileNav();
      }
    });
  }

  function toggleMobileNav() {
    if (cache.$mobileNavToggle.hasClass(classes.mobileNavCloseIcon)) {
      closeMobileNav();
    } else {
      openMobileNav();
    }
  }

  function cacheSelectors() {
    cache = {
      $pageContainer: $('#PageContainer'),
      $siteHeader: $('.site-header'),
      $mobileNavToggle: $('.js-mobile-nav-toggle'),
      $mobileNavContainer: $('.mobile-nav-wrapper'),
      $mobileNav: $('#MobileNav'),
      $sectionHeader: $('#shopify-section-header'),
      $subNavToggleBtn: $('.' + classes.subNavToggleBtn)
    };
  }

  function openMobileNav() {
	  //console.log("working");
    document.body.classList.add('layOver');
    var translateHeaderHeight =
      cache.$siteHeader.outerHeight() + cache.$siteHeader.position().top;
    cache.$mobileNavContainer.prepareTransition().addClass(classes.navOpen);

    cache.$mobileNavContainer.css({
      transform: 'translateX(0)'
    });

    slate.a11y.trapFocus({
      $container: cache.$sectionHeader,
      $elementToFocus: cache.$mobileNav
        .find('.' + classes.navLinkWrapper + ':first')
        .find('.' + classes.navLink),
      namespace: 'navFocus'
    });

    cache.$mobileNavToggle
      .addClass(classes.mobileNavCloseIcon)
      .removeClass(classes.mobileNavOpenIcon);

    // close on escape
    $(window).on('keyup.mobileNav', function(evt) {
      if (evt.which === 27) {
        closeMobileNav();
      }
    });

    $(document).bind('mouseup, touchend', function (e) {
      var container = $("#MobileNav");
      if (!container.is(e.target) && container.has(e.target).length === 0) {
        closeMobileNav();
      }
    });
  }



  function closeMobileNav() {
    document.body.className = document.body.className.replace("layOver","");
    cache.$mobileNavContainer.prepareTransition().removeClass(classes.navOpen);

    cache.$mobileNavContainer.css({
      transform: 'translateX(-100%)'
    });

    cache.$pageContainer.removeAttr('style');

    cache.$mobileNavContainer.one(
      'TransitionEnd.navToggle webkitTransitionEnd.navToggle transitionend.navToggle oTransitionEnd.navToggle',
      function() {
        slate.a11y.removeTrapFocus({
          $container: cache.$mobileNav,
          namespace: 'navFocus'
        });
      }
    );

    cache.$mobileNavToggle
      .addClass(classes.mobileNavOpenIcon)
      .removeClass(classes.mobileNavCloseIcon);

    $(window).off('keyup.mobileNav');
  }

  function toggleSubNav(evt) {
    if (isTransitioning) {
      return;
    }

    var $toggleBtn = $(evt.currentTarget);
    var isReturn = $toggleBtn.hasClass(classes.return);
    isTransitioning = true;

    if (isReturn) {
      // Close all subnavs by removing active class on buttons
      $(
        '.' + classes.subNavToggleBtn + '[data-level="' + (menuLevel - 1) + '"]'
      ).removeClass(classes.subNavActive);

      if ($activeTrigger && $activeTrigger.length) {
        $activeTrigger.removeClass(classes.subNavActive);
      }
    } else {
      $toggleBtn.addClass(classes.subNavActive);
    }

    $activeTrigger = $toggleBtn;

    goToSubnav($toggleBtn.data('target'));
  }

  function goToSubnav(target) {
    /*eslint-disable shopify/jquery-dollar-sign-reference */

    var $targetMenu = target
      ? $('.mobile-nav__dropdown[data-parent="' + target + '"]')
      : cache.$mobileNav;

    menuLevel = $targetMenu.data('level') ? $targetMenu.data('level') : 1;

    if ($activeSubNav && $activeSubNav.length) {
      $activeSubNav.prepareTransition().addClass(classes.subNavClosing);
    }

    $activeSubNav = $targetMenu;

    var $elementToFocus = target
      ? $targetMenu.find('.' + classes.subNavLink + ':first')
      : $activeTrigger;

    /*eslint-enable shopify/jquery-dollar-sign-reference */

    var translateMenuHeight = $targetMenu.outerHeight();

    var openNavClass =
      menuLevel > 2 ? classes.thirdNavShowing : classes.subNavShowing;

    cache.$mobileNavContainer
      .removeClass(classes.thirdNavShowing)
      .addClass(openNavClass);

    if (!target) {
      // Show top level nav
      cache.$mobileNavContainer
        .removeClass(classes.thirdNavShowing)
        .removeClass(classes.subNavShowing);
    }

    // Focusing an item in the subnav early forces element into view and breaks the animation.
    cache.$mobileNavContainer.one(
      'TransitionEnd.subnavToggle webkitTransitionEnd.subnavToggle transitionend.subnavToggle oTransitionEnd.subnavToggle',
      function() {
        slate.a11y.trapFocus({
          $container: $targetMenu,
          $elementToFocus: $elementToFocus,
          namespace: 'subNavFocus'
        });

        cache.$mobileNavContainer.off('.subnavToggle');
        isTransitioning = false;
      }
    );

    // Match height of subnav
    cache.$pageContainer.css({
      transform: 'translateX(0)'
    });

    $activeSubNav.removeClass(classes.subNavClosing);
  }

  return {
    init: init, cartUpdateCallback: (typeof cartUpdateCallback !== 'undefined' ? cartUpdateCallback : null),
    closeMobileNav: closeMobileNav
  };
})(jQuery);

window.theme = window.theme || {};

/*theme.Search = (function() {
  var selectors = {
    search: '.search',
    searchSubmit: '.search__submit',
    searchInput: '.search__input',

    siteHeader: '.site-header',
    siteHeaderSearchToggle: '.site-header__search-toggle',
    siteHeaderSearch: '.site-header__search',

    searchDrawer: '.search-bar',
    searchDrawerInput: '.search-bar__input',

    searchHeader: '.search-header',
    searchHeaderInput: '.search-header__input',
    searchHeaderSubmit: '.search-header__submit',

    mobileNavWrapper: '.mobile-nav-wrapper'
  };

  var classes = {
    focus: 'search--focus',
    mobileNavIsOpen: 'js-menu--is-open'
  };

  function init() {
    if (!$(selectors.siteHeader).length) {
      return;
    }

    initDrawer();
    searchSubmit();

    $(selectors.searchHeaderInput)
      .add(selectors.searchHeaderSubmit)
      .on('focus blur', function() {
        $(selectors.searchHeader).toggleClass(classes.focus);
      });

    $(selectors.siteHeaderSearchToggle).on('click', function() {
      var searchHeight = $(selectors.siteHeader).outerHeight();
      var searchOffset = $(selectors.siteHeader).offset().top - searchHeight;

      $(selectors.searchDrawer).css({
        height: searchHeight + 'px',
        top: searchOffset + 'px'
      });
    });
  }

  function initDrawer() {
    // Add required classes to HTML
    $('#PageContainer').addClass('drawer-page-content');
    $('.js-drawer-open-top')
      .attr('aria-controls', 'SearchDrawer')
      .attr('aria-expanded', 'false');

    theme.SearchDrawer = new theme.Drawers('SearchDrawer', 'top', {
      onDrawerOpen: searchDrawerFocus
    });
  }

  function searchDrawerFocus() {
    searchFocus($(selectors.searchDrawerInput));

    if ($(selectors.mobileNavWrapper).hasClass(classes.mobileNavIsOpen)) {
      theme.MobileNav.closeMobileNav();
    }
  }

  function searchFocus($el) {
    $el.focus();
    // set selection range hack for iOS
    $el[0].setSelectionRange(0, $el[0].value.length);
  }

  function searchSubmit() {
    $(selectors.searchSubmit).on('click', function(evt) {
      var $el = $(evt.target);
      var $input = $el.parents(selectors.search).find(selectors.searchInput);
      if ($input.val().length === 0) {
        evt.preventDefault();
        searchFocus($input);
      }
    });
  }

  return {
    init: init, cartUpdateCallback: (typeof cartUpdateCallback !== 'undefined' ? cartUpdateCallback : null)
  };
})();*/

(function() {
  var selectors = {
    backButton: '.return-link'
  };

  var $backButton = $(selectors.backButton);

  if (!document.referrer || !$backButton.length || !window.history.length) {
    return;
  }

  $backButton.one('click', function(evt) {
    evt.preventDefault();

    var referrerDomain = urlDomain(document.referrer);
    var shopDomain = urlDomain(window.location.href);

    if (shopDomain === referrerDomain) {
      history.back();
    }

    return false;
  });

  function urlDomain(url) {
    var anchor = document.createElement('a');
    anchor.ref = url;

    return anchor.hostname;
  }
})();

theme.Slideshow = (function() {
  this.$slideshow = null;
  var classes = {
    wrapper: 'slideshow-wrapper',
    slideshow: 'slideshow',
    currentSlide: 'slick-current',
    video: 'slideshow__video',
    videoBackground: 'slideshow__video--background',
    closeVideoBtn: 'slideshow__video-control--close',
    pauseButton: 'slideshow__pause',
    isPaused: 'is-paused'
  };

  function slideshow(el) {
    this.$slideshow = $(el);
    this.$wrapper = this.$slideshow.closest('.' + classes.wrapper);
    this.$pause = this.$wrapper.find('.' + classes.pauseButton);

    this.settings = {
      accessibility: true,
      arrows: false,
      dots: true,
      fade: true,
      draggable: true,
      touchThreshold: 20,
      autoplay: this.$slideshow.data('autoplay'),
      autoplaySpeed: this.$slideshow.data('speed')
    };

    this.$slideshow.on('beforeChange', beforeChange.bind(this));
    this.$slideshow.on('init', slideshowA11y.bind(this));
    this.$slideshow.slick(this.settings);

    this.$pause.on('click', this.togglePause.bind(this));
  }

  function slideshowA11y(event, obj) {
    var $slider = obj.$slider;
    var $list = obj.$list;
    var $wrapper = this.$wrapper;
    var autoplay = this.settings.autoplay;

    // Remove default Slick aria-live attr until slider is focused
    $list.removeAttr('aria-live');

    // When an element in the slider is focused
    // pause slideshow and set aria-live.
    $wrapper.on('focusin', function(evt) {
      if (!$wrapper.has(evt.target).length) {
        return;
      }

      $list.attr('aria-live', 'polite');

      if (autoplay) {
        $slider.slick('slickPause');
      }
    });

    // Resume autoplay
    $wrapper.on('focusout', function(evt) {
      if (!$wrapper.has(evt.target).length) {
        return;
      }

      $list.removeAttr('aria-live');

      if (autoplay) {
        // Manual check if the focused element was the video close button
        // to ensure autoplay does not resume when focus goes inside YouTube iframe
        if ($(evt.target).hasClass(classes.closeVideoBtn)) {
          return;
        }

        $slider.slick('slickPlay');
      }
    });

    // Add arrow key support when focused
    if (obj.$dots) {
      obj.$dots.on('keydown', function(evt) {
        if (evt.which === 37) {
          $slider.slick('slickPrev');
        }

        if (evt.which === 39) {
          $slider.slick('slickNext');
        }

        // Update focus on newly selected tab
        if (evt.which === 37 || evt.which === 39) {
          obj.$dots.find('.slick-active button').focus();
        }
      });
    }
  }

  function beforeChange(event, slick, currentSlide, nextSlide) {
    var $slider = slick.$slider;
    var $currentSlide = $slider.find('.' + classes.currentSlide);
    var $nextSlide = $slider.find(
      '.slideshow__slide[data-slick-index="' + nextSlide + '"]'
    );

    if (isVideoInSlide($currentSlide)) {
      var $currentVideo = $currentSlide.find('.' + classes.video);
      var currentVideoId = $currentVideo.attr('id');
      theme.SlideshowVideo.pauseVideo(currentVideoId);
      $currentVideo.attr('tabindex', '-1');
    }

    if (isVideoInSlide($nextSlide)) {
      var $video = $nextSlide.find('.' + classes.video);
      var videoId = $video.attr('id');
      var isBackground = $video.hasClass(classes.videoBackground);
      if (isBackground) {
        theme.SlideshowVideo.playVideo(videoId);
      } else {
        $video.attr('tabindex', '0');
      }
    }
  }

  function isVideoInSlide($slide) {
    return $slide.find('.' + classes.video).length;
  }

  slideshow.prototype.togglePause = function() {
    var slideshowSelector = getSlideshowId(this.$pause);
    if (this.$pause.hasClass(classes.isPaused)) {
      this.$pause.removeClass(classes.isPaused);
      $(slideshowSelector).slick('slickPlay');
    } else {
      this.$pause.addClass(classes.isPaused);
      $(slideshowSelector).slick('slickPause');
    }
  };

  function getSlideshowId($el) {
    return '#Slideshow-' + $el.data('id');
  }

  return slideshow;
})();

// Youtube API callback
// eslint-disable-next-line no-unused-vars
function onYouTubeIframeAPIReady() {
  theme.SlideshowVideo.loadVideos();
}

theme.SlideshowVideo = (function() {
  var autoplayCheckComplete = false;
  var autoplayAvailable = false;
  var playOnClickChecked = false;
  var playOnClick = false;
  var youtubeLoaded = false;
  var videos = {};
  var videoPlayers = [];
  var videoOptions = {
    ratio: 16 / 9,
    playerVars: {
      // eslint-disable-next-line camelcase
      iv_load_policy: 3,
      modestbranding: 1,
      autoplay: 0,
      controls: 0,
      showinfo: 0,
      wmode: 'opaque',
      branding: 0,
      autohide: 0,
      rel: 0
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerChange
    }
  };
  var classes = {
    playing: 'video-is-playing',
    paused: 'video-is-paused',
    loading: 'video-is-loading',
    loaded: 'video-is-loaded',
    slideshowWrapper: 'slideshow-wrapper',
    slide: 'slideshow__slide',
    slideBackgroundVideo: 'slideshow__slide--background-video',
    slideDots: 'slick-dots',
    videoChrome: 'slideshow__video--chrome',
    videoBackground: 'slideshow__video--background',
    playVideoBtn: 'slideshow__video-control--play',
    closeVideoBtn: 'slideshow__video-control--close',
    currentSlide: 'slick-current',
    slickClone: 'slick-cloned',
    supportsAutoplay: 'autoplay',
    supportsNoAutoplay: 'no-autoplay'
  };

  /**
    * Public functions
   */
  function init($video) {
    if (!$video.length) {
      return;
    }

    videos[$video.attr('id')] = {
      id: $video.attr('id'),
      videoId: $video.data('id'),
      type: $video.data('type'),
      status: $video.data('type') === 'chrome' ? 'closed' : 'background', // closed, open, background
      videoSelector: $video.attr('id'),
      $parentSlide: $video.closest('.' + classes.slide),
      $parentSlideshowWrapper: $video.closest('.' + classes.slideshowWrapper),
      controls: $video.data('type') === 'background' ? 0 : 1,
      slideshow: $video.data('slideshow')
    };

    if (!youtubeLoaded) {
      // This code loads the IFrame Player API code asynchronously.
      var tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }

  function customPlayVideo(playerId) {
    // Do not autoplay just because the slideshow asked you to.
    // If the slideshow asks to play a video, make sure
    // we have done the playOnClick check first
    if (!playOnClickChecked && !playOnClick) {
      return;
    }

    if (playerId && typeof videoPlayers[playerId].playVideo === 'function') {
      privatePlayVideo(playerId);
    }
  }

  function pauseVideo(playerId) {
    if (
      videoPlayers[playerId] &&
      typeof videoPlayers[playerId].pauseVideo === 'function'
    ) {
      videoPlayers[playerId].pauseVideo();
    }
  }

  function loadVideos() {
    for (var key in videos) {
      if (videos.hasOwnProperty(key)) {
        var args = $.extend({}, videoOptions, videos[key]);
        args.playerVars.controls = args.controls;
        videoPlayers[key] = new YT.Player(key, args);
      }
    }

    initEvents();
    youtubeLoaded = true;
  }

  function loadVideo(key) {
    if (!youtubeLoaded) {
      return;
    }
    var args = $.extend({}, videoOptions, videos[key]);
    args.playerVars.controls = args.controls;
    videoPlayers[key] = new YT.Player(key, args);

    initEvents();
  }

  /**
    * Private functions
   */

  function privatePlayVideo(id, clicked) {
    var videoData = videos[id];
    var player = videoPlayers[id];
    var $slide = videos[id].$parentSlide;

    if (playOnClick) {
      // playOnClick means we are probably on mobile (no autoplay).
      // setAsPlaying will show the iframe, requiring another click
      // to play the video.
      setAsPlaying(videoData);
    } else if (clicked || (autoplayCheckComplete && autoplayAvailable)) {
      // Play if autoplay is available or clicked to play
      $slide.removeClass(classes.loading);
      setAsPlaying(videoData);
      player.playVideo();
      return;
    }

    // Check for autoplay if not already done
    if (!autoplayCheckComplete) {
      autoplayCheckFunction(player, $slide);
    }
  }

  function setAutoplaySupport(supported) {
    var supportClass = supported
      ? classes.supportsAutoplay
      : classes.supportsNoAutoplay;
    $(document.documentElement).addClass(supportClass);

    if (!supported) {
      playOnClick = true;
    }

    autoplayCheckComplete = true;
  }

  function autoplayCheckFunction(player, $slide) {
    // attempt to play video
    player.playVideo();

    autoplayTest(player)
      .then(function() {
        setAutoplaySupport(true);
      })
      .fail(function() {
        // No autoplay available (or took too long to start playing).
        // Show fallback image. Stop video for safety.
        setAutoplaySupport(false);
        player.stopVideo();
      })
      .always(function() {
        autoplayCheckComplete = true;
        $slide.removeClass(classes.loading);
      });
  }

  function autoplayTest(player) {
    var deferred = $.Deferred();
    var wait;
    var timeout;

    wait = setInterval(function() {
      if (player.getCurrentTime() <= 0) {
        return;
      }

      autoplayAvailable = true;
      clearInterval(wait);
      clearTimeout(timeout);
      deferred.resolve();
    }, 500);

    timeout = setTimeout(function() {
      clearInterval(wait);
      deferred.reject();
    }, 4000); // subjective. test up to 8 times over 4 seconds

    return deferred;
  }

  function playOnClickCheck() {
    // Bail early for a few instances:
    // - small screen
    // - device sniff mobile browser

    if (playOnClickChecked) {
      return;
    }

    if ($(window).width() < 750) {
      playOnClick = true;
    } else if (window.mobileCheck()) {
      playOnClick = true;
    }

    if (playOnClick) {
      // No need to also do the autoplay check
      setAutoplaySupport(false);
    }

    playOnClickChecked = true;
  }

  // The API will call this function when each video player is ready
  function onPlayerReady(evt) {
    evt.target.setPlaybackQuality('hd1080');
    var videoData = getVideoOptions(evt);

    playOnClickCheck();

    // Prevent tabbing through YouTube player controls until visible
    $('#' + videoData.id).attr('tabindex', '-1');

    sizeBackgroundVideos();

    // Customize based on options from the video ID
    switch (videoData.type) {
      case 'background-chrome':
      case 'background':
        evt.target.mute();
        // Only play the video if it is in the active slide
        if (videoData.$parentSlide.hasClass(classes.currentSlide)) {
          privatePlayVideo(videoData.id);
        }
        break;
    }

    videoData.$parentSlide.addClass(classes.loaded);
  }

  function onPlayerChange(evt) {
    var videoData = getVideoOptions(evt);

    switch (evt.data) {
      case 0: // ended
        setAsFinished(videoData);
        break;
      case 1: // playing
        setAsPlaying(videoData);
        break;
      case 2: // paused
        setAsPaused(videoData);
        break;
    }
  }

  function setAsFinished(videoData) {
    switch (videoData.type) {
      case 'background':
        videoPlayers[videoData.id].seekTo(0);
        break;
      case 'background-chrome':
        videoPlayers[videoData.id].seekTo(0);
        closeVideo(videoData.id);
        break;
      case 'chrome':
        closeVideo(videoData.id);
        break;
    }
  }

  function setAsPlaying(videoData) {
    var $slideshow = videoData.$parentSlideshowWrapper;
    var $slide = videoData.$parentSlide;

    $slide.removeClass(classes.loading);

    // Do not change element visibility if it is a background video
    if (videoData.status === 'background') {
      return;
    }

    $('#' + videoData.id).attr('tabindex', '0');

    switch (videoData.type) {
      case 'chrome':
      case 'background-chrome':
        $slideshow.removeClass(classes.paused).addClass(classes.playing);
        $slide.removeClass(classes.paused).addClass(classes.playing);
        break;
    }

    // Update focus to the close button so we stay within the slide
    $slide.find('.' + classes.closeVideoBtn).focus();
  }

  function setAsPaused(videoData) {
    var $slideshow = videoData.$parentSlideshowWrapper;
    var $slide = videoData.$parentSlide;

    if (videoData.type === 'background-chrome') {
      closeVideo(videoData.id);
      return;
    }

    // YT's events fire after our click event. This status flag ensures
    // we don't interact with a closed or background video.
    if (videoData.status !== 'closed' && videoData.type !== 'background') {
      $slideshow.addClass(classes.paused);
      $slide.addClass(classes.paused);
    }

    if (videoData.type === 'chrome' && videoData.status === 'closed') {
      $slideshow.removeClass(classes.paused);
      $slide.removeClass(classes.paused);
    }

    $slideshow.removeClass(classes.playing);
    $slide.removeClass(classes.playing);
  }

  function closeVideo(playerId) {
    var videoData = videos[playerId];
    var $slideshow = videoData.$parentSlideshowWrapper;
    var $slide = videoData.$parentSlide;
    var classesToRemove = [classes.pause, classes.playing].join(' ');

    $('#' + videoData.id).attr('tabindex', '-1');

    videoData.status = 'closed';

    switch (videoData.type) {
      case 'background-chrome':
        videoPlayers[playerId].mute();
        setBackgroundVideo(playerId);
        break;
      case 'chrome':
        videoPlayers[playerId].stopVideo();
        setAsPaused(videoData); // in case the video is already paused
        break;
    }

    $slideshow.removeClass(classesToRemove);
    $slide.removeClass(classesToRemove);
  }

  function getVideoOptions(evt) {
    return videos[evt.target.h.id];
  }

  function startVideoOnClick(playerId) {
    var videoData = videos[playerId];
    // add loading class to slide
    videoData.$parentSlide.addClass(classes.loading);

    videoData.status = 'open';

    switch (videoData.type) {
      case 'background-chrome':
        unsetBackgroundVideo(playerId, videoData);
        videoPlayers[playerId].unMute();
        privatePlayVideo(playerId, true);
        break;
      case 'chrome':
        privatePlayVideo(playerId, true);
        break;
    }

    // esc to close video player
    $(document).on('keydown.videoPlayer', function(evt) {
      if (evt.keyCode === 27) {
        closeVideo(playerId);
      }
    });
  }

  function sizeBackgroundVideos() {
    $('.' + classes.videoBackground).each(function(index, el) {
      sizeBackgroundVideo($(el));
    });
  }

  function sizeBackgroundVideo($player) {
    var $slide = $player.closest('.' + classes.slide);
    // Ignore cloned slides
    if ($slide.hasClass(classes.slickClone)) {
      return;
    }
    var slideWidth = $slide.width();
    var playerWidth = $player.width();
    var playerHeight = $player.height();

    // when screen aspect ratio differs from video, video must center and underlay one dimension
    if (slideWidth / videoOptions.ratio < playerHeight) {
      playerWidth = Math.ceil(playerHeight * videoOptions.ratio); // get new player width
      $player
        .width(playerWidth)
        .height(playerHeight)
        .css({
          left: (slideWidth - playerWidth) / 2,
          top: 0
        }); // player width is greater, offset left; reset top
    } else {
      // new video width < window width (gap to right)
      playerHeight = Math.ceil(slideWidth / videoOptions.ratio); // get new player height
      $player
        .width(slideWidth)
        .height(playerHeight)
        .css({
          left: 0,
          top: (playerHeight - playerHeight) / 2
        }); // player height is greater, offset top; reset left
    }

    $player.prepareTransition().addClass(classes.loaded);
  }

  function unsetBackgroundVideo(playerId) {
    // Switch the background-chrome to a chrome-only player once played
    $('#' + playerId)
      .removeAttr('style')
      .removeClass(classes.videoBackground)
      .addClass(classes.videoChrome);

    videos[playerId].$parentSlideshowWrapper
      .removeClass(classes.slideBackgroundVideo)
      .addClass(classes.playing);

    videos[playerId].$parentSlide
      .removeClass(classes.slideBackgroundVideo)
      .addClass(classes.playing);

    videos[playerId].status = 'open';
  }

  function setBackgroundVideo(playerId) {
    // Switch back to background-chrome when closed
    var $player = $('#' + playerId)
      .addClass(classes.videoBackground)
      .removeClass(classes.videoChrome);

    videos[playerId].$parentSlide.addClass(classes.slideBackgroundVideo);

    videos[playerId].status = 'background';
    sizeBackgroundVideo($player);
  }

  function initEvents() {
    $(document).on('click.videoPlayer', '.' + classes.playVideoBtn, function(
      evt
    ) {
      var playerId = $(evt.currentTarget).data('controls');
      startVideoOnClick(playerId);
    });

    $(document).on('click.videoPlayer', '.' + classes.closeVideoBtn, function(
      evt
    ) {
      var playerId = $(evt.currentTarget).data('controls');
      closeVideo(playerId);
    });

    // Listen to resize to keep a background-size:cover-like layout
    $(window).on(
      'resize.videoPlayer',
      $.debounce(250, function() {
        if (youtubeLoaded) {
          sizeBackgroundVideos();
        }
      })
    );
  }

  function removeEvents() {
    $(document).off('.videoPlayer');
    $(window).off('.videoPlayer');
  }

  return {
    init: init, cartUpdateCallback: (typeof cartUpdateCallback !== 'undefined' ? cartUpdateCallback : null),
    loadVideos: loadVideos,
    loadVideo: loadVideo,
    playVideo: customPlayVideo,
    pauseVideo: pauseVideo,
    removeEvents: removeEvents
  };
})();


/* ================ TEMPLATES ================ */
(function() {
  var $filterBy = $('#BlogTagFilter');

  if (!$filterBy.length) {
    return;
  }

  $filterBy.on('change', function() {
    location.href = $(this).val();
  });
})();

window.theme = theme || {};

theme.customerTemplates = (function() {
  function initEventListeners() {
    // Show reset password form
    $('#RecoverPassword').on('click', function(evt) {
      evt.preventDefault();
      toggleRecoverPasswordForm();
    });

    // Hide reset password form
    $('#HideRecoverPasswordLink').on('click', function(evt) {
      evt.preventDefault();
      toggleRecoverPasswordForm();
    });
  }

  /**
   *
   *  Show/Hide recover password form
   *
   */
  function toggleRecoverPasswordForm() {
    $('#RecoverPasswordForm').toggleClass('hide');
    $('#CustomerLoginForm').toggleClass('hide');
  }

  /**
   *
   *  Show reset password success message
   *
   */
  function resetPasswordSuccess() {
    var $formState = $('.reset-password-success');

    // check if reset password form was successfully submited.
    if (!$formState.length) {
      return;
    }

    // show success message
    $('#ResetSuccess').removeClass('hide');
  }

  /**
   *
   *  Show/hide customer address forms
   *
   */
  function customerAddressForm() {
    var $newAddressForm = $('#AddressNewForm');

    if (!$newAddressForm.length) {
      return;
    }

    // Initialize observers on address selectors, defined in shopify_common.js
    if (Shopify) {
      // eslint-disable-next-line no-new
      new Shopify.CountryProvinceSelector(
        'AddressCountryNew',
        'AddressProvinceNew',
        {
          hideElement: 'AddressProvinceContainerNew'
        }
      );
    }

    // Initialize each edit form's country/province selector
    $('.address-country-option').each(function() {
      var formId = $(this).data('form-id');
      var countrySelector = 'AddressCountry_' + formId;
      var provinceSelector = 'AddressProvince_' + formId;
      var containerSelector = 'AddressProvinceContainer_' + formId;

      // eslint-disable-next-line no-new
      new Shopify.CountryProvinceSelector(countrySelector, provinceSelector, {
        hideElement: containerSelector
      });
    });

    // Toggle new/edit address forms
    $('.address-new-toggle').on('click', function() {
      $newAddressForm.toggleClass('hide');
    });

    $('.address-edit-toggle').on('click', function() {
      var formId = $(this).data('form-id');
      $('#EditAddress_' + formId).toggleClass('hide');
    });

    $('.address-delete').on('click', function() {
      var $el = $(this);
      var formId = $el.data('form-id');
      var confirmMessage = $el.data('confirm-message');

      // eslint-disable-next-line no-alert
      if (
        confirm(
          confirmMessage || 'Are you sure you wish to delete this address?'
        )
      ) {
        Shopify.postLink('/account/addresses/' + formId, {
          parameters: { _method: 'delete' }
        });
      }
    });
  }

  /**
   *
   *  Check URL for reset password hash
   *
   */
  function checkUrlHash() {
    var hash = window.location.hash;

    // Allow deep linking to recover password form
    if (hash === '#recover') {
      toggleRecoverPasswordForm();
    }
  }

  return {
    init: function() {
      checkUrlHash();
      initEventListeners();
      resetPasswordSuccess();
      customerAddressForm();
    }
  };
})();


/*================ SECTIONS ================*/
window.theme = window.theme || {};

theme.Cart = (function() {
  var selectors = {
    edit: '.js-edit-toggle'
  };
  var config = {
    showClass: 'cart__update--show',
    showEditClass: 'cart__edit--active',
    cartNoCookies: 'cart--no-cookies'
  };

  function Cart(container) {
    this.$container = $(container);
    this.$edit = $(selectors.edit, this.$container);

    if (!this.cookiesEnabled()) {
      this.$container.addClass(config.cartNoCookies);
    }

    this.$edit.on('click', this._onEditClick.bind(this));
  }

  Cart.prototype = _.assignIn({}, Cart.prototype, {
    onUnload: function() {
      this.$edit.off('click', this._onEditClick);
    },

    _onEditClick: function(evt) {
      var $evtTarget = $(evt.target);
      var $updateLine = $('.' + $evtTarget.data('target'));

      $evtTarget.toggleClass(config.showEditClass);
      $updateLine.toggleClass(config.showClass);
    },

    cookiesEnabled: function() {
      var cookieEnabled = navigator.cookieEnabled;

      if (!cookieEnabled) {
        document.cookie = 'testcookie';
        cookieEnabled = document.cookie.indexOf('testcookie') !== -1;
      }
      return cookieEnabled;
    }
  });

  return Cart;
})();

window.theme = window.theme || {};

theme.Filters = (function() {
  var constants = {
    SORT_BY: 'sort_by'
  };
  var selectors = {
    filterSelection: '#SortTags',
    sortSelection: '#SortBy',
    defaultSort: '#DefaultSortBy'
  };

  function Filters(container) {
    var $container = (this.$container = $(container));

    this.$filterSelect = $(selectors.filterSelection, $container);
    this.$sortSelect = $(selectors.sortSelection, $container);
    this.$selects = $(selectors.filterSelection, $container).add(
      $(selectors.sortSelection, $container)
    );

    this.defaultSort = this._getDefaultSortValue();
    this._resizeSelect(this.$selects);
    this.$selects.removeClass('hidden');

    this.$filterSelect.on('change', this._onFilterChange.bind(this));
    this.$sortSelect.on('change', this._onSortChange.bind(this));
  }

  Filters.prototype = _.assignIn({}, Filters.prototype, {
    _onSortChange: function(evt) {
      var sort = this._sortValue();
      if (sort.length) {
        window.location.search = sort;
      } else {
        // clean up our url if the sort value is blank for default
        window.location.href = window.location.href.replace(
          window.location.search,
          ''
        );
      }
      this._resizeSelect($(evt.target));
    },

    _onFilterChange: function(evt) {
      var filter = this._getFilterValue();

      // remove the 'page' parameter to go to the first page of results
      var search = document.location.search.replace(/\?(page=\w+)?&?/, '');

      if (Shopify.designMode) {
        if (search.match('sort_by')) {
          search = search.substring(search.indexOf('sort_by'));
        } else {
          search = '';
        }
      }

      // restore the selected sorting order
      if (search.match(constants.SORT_BY)) {
        search = '?' + search;
      }
      document.location.href = filter + search;
      this._resizeSelect($(evt.target));
    },

    _getFilterValue: function() {
      return this.$filterSelect.val();
    },

    _getSortValue: function() {
      return this.$sortSelect.val() || this.defaultSort;
    },

    _getDefaultSortValue: function() {
      return $(selectors.defaultSort, this.$container).val();
    },

    _sortValue: function() {
      var sort = this._getSortValue();
      var query = '';

      if (sort !== this.defaultSort) {
        query = constants.SORT_BY + '=' + sort;
      }

      return query;
    },

    _resizeSelect: function($selection) {
      $selection.each(function() {
        var $this = $(this);
        var arrowWidth = 10;
        // create test element
        var text = $this.find('option:selected').text();
        var $test = $('<span>').html(text);

        // add to body, get width, and get out
        $test.appendTo('body');
        var width = $test.width();
        $test.remove();

        // set select width
        $this.width(width + arrowWidth);
      });
    },

    onUnload: function() {
      this.$filterSelect.off('change', this._onFilterChange);
      this.$sortSelect.off('change', this._onSortChange);
    }
  });

  return Filters;
})();

window.theme = window.theme || {};

theme.HeaderSection = (function() {
  function Header() {
    theme.Header.init();
    theme.MobileNav.init();
  }

  Header.prototype = _.assignIn({}, Header.prototype, {
    onUnload: function() {
      theme.Header.unload();
    }
  });

  return Header;
})();

theme.Maps = (function() {
  var config = {
    zoom: 14
  };
  var apiStatus = null;
  var mapsToLoad = [];

  var errors = {
    addressNoResults: theme.strings.addressNoResults,
    addressQueryLimit: theme.strings.addressQueryLimit,
    addressError: theme.strings.addressError,
    authError: theme.strings.authError
  };

  var selectors = {
    section: '[data-section-type="map"]',
    map: '[data-map]',
    mapOverlay: '[data-map-overlay]'
  };

  var classes = {
    mapError: 'map-section--load-error',
    errorMsg: 'map-section__error errors text-center'
  };

  // Global function called by Google on auth errors.
  // Show an auto error message on all map instances.
  // eslint-disable-next-line camelcase, no-unused-vars
  window.gm_authFailure = function() {
    if (!Shopify.designMode) {
      return;
    }

    $(selectors.section).addClass(classes.mapError);
    $(selectors.map).remove();
    $(selectors.mapOverlay).after(
      '<div class="' +
        classes.errorMsg +
        '">' +
        theme.strings.authError +
        '</div>'
    );
  };

  function Map(container) {
    this.$container = $(container);
    this.$map = this.$container.find(selectors.map);
    this.key = this.$map.data('api-key');

    if (typeof this.key === 'undefined') {
      return;
    }

    if (apiStatus === 'loaded') {
      this.createMap();
    } else {
      mapsToLoad.push(this);

      if (apiStatus !== 'loading') {
        apiStatus = 'loading';
        if (typeof window.google === 'undefined') {
          $.getScript(
            'https://maps.googleapis.com/maps/api/js?key=' + this.key
          ).then(function() {
            apiStatus = 'loaded';
            initAllMaps();
          });
        }
      }
    }
  }

  function initAllMaps() {
    // API has loaded, load all Map instances in queue
    $.each(mapsToLoad, function(index, instance) {
      instance.createMap();
    });
  }

  function geolocate($map) {
    var deferred = $.Deferred();
    var geocoder = new google.maps.Geocoder();
    var address = $map.data('address-setting');

    geocoder.geocode({ address: address }, function(results, status) {
      if (status !== google.maps.GeocoderStatus.OK) {
        deferred.reject(status);
      }

      deferred.resolve(results);
    });

    return deferred;
  }

  Map.prototype = _.assignIn({}, Map.prototype, {
    createMap: function() {
      var $map = this.$map;

      return geolocate($map)
        .then(
          function(results) {
            var mapOptions = {
              zoom: config.zoom,
              center: results[0].geometry.location,
              draggable: false,
              clickableIcons: false,
              scrollwheel: false,
              disableDoubleClickZoom: true,
              disableDefaultUI: true
            };

            var map = (this.map = new google.maps.Map($map[0], mapOptions));
            var center = (this.center = map.getCenter());

            //eslint-disable-next-line no-unused-vars
            var marker = new google.maps.Marker({
              map: map,
              position: map.getCenter()
            });

            google.maps.event.addDomListener(
              window,
              'resize',
              $.debounce(250, function() {
                google.maps.event.trigger(map, 'resize');
                map.setCenter(center);
                $map.removeAttr('style');
              })
            );
          }.bind(this)
        )
        .fail(function() {
          var errorMessage;

          switch (status) {
            case 'ZERO_RESULTS':
              errorMessage = errors.addressNoResults;
              break;
            case 'OVER_QUERY_LIMIT':
              errorMessage = errors.addressQueryLimit;
              break;
            case 'REQUEST_DENIED':
              errorMessage = errors.authError;
              break;
            default:
              errorMessage = errors.addressError;
              break;
          }

          // Show errors only to merchant in the editor.
          if (Shopify.designMode) {
            $map
              .parent()
              .addClass(classes.mapError)
              .html(
                '<div class="' +
                  classes.errorMsg +
                  '">' +
                  errorMessage +
                  '</div>'
              );
          }
        });
    },

    onUnload: function() {
      if (this.$map.length === 0) {
        return;
      }
      google.maps.event.clearListeners(this.map, 'resize');
    }
  });

  return Map;
})();

/* eslint-disable no-new */
theme.Product = (function() {
  function Product(container) {
    var $container = (this.$container = $(container));
    var sectionId = $container.attr('data-section-id');

    this.settings = {
      // Breakpoints from src/stylesheets/global/variables.scss.liquid
      mediaQueryMediumUp: 'screen and (min-width: 750px)',
      mediaQuerySmall: 'screen and (max-width: 749px)',
      bpSmall: false,
      enableHistoryState: $container.data('enable-history-state') || false,
      namespace: '.slideshow-' + sectionId,
      sectionId: sectionId,
      sliderActive: false,
      zoomEnabled: false
    };

    this.selectors = {
      addToCart: '#AddToCart-' + sectionId,
      addToCartText: '#AddToCartText-' + sectionId,
      comparePrice: '#ComparePrice-' + sectionId,
      originalPrice: '#ProductPrice-' + sectionId,
      SKU: '.variant-sku',
      originalPriceWrapper: '.product-price__price-' + sectionId,
      originalSelectorId: '#ProductSelect-' + sectionId,
      productImageWraps: '.product-single__photo',
      productPrices: '.product-single__price-' + sectionId,
      productThumbImages: '.product-single__thumbnail--' + sectionId,
      productThumbs: '.product-single__thumbnails-' + sectionId,
      saleClasses: 'product-price__sale product-price__sale--single',
      saleLabel: '.product-price__sale-label-' + sectionId,
      singleOptionSelector: '.single-option-selector-' + sectionId
    };

    // Stop parsing if we don't have the product json script tag when loading
    // section in the Theme Editor
    if (!$('#ProductJson-' + sectionId).html()) {
      return;
    }

    this.productSingleObject = JSON.parse(
      document.getElementById('ProductJson-' + sectionId).innerHTML
    );

    this.settings.zoomEnabled = $(this.selectors.productImageWraps).hasClass(
      'js-zoom-enabled'
    );

    this._initBreakpoints();
    this._stringOverrides();
    this._initVariants();
    this._initImageSwitch();
    this._setActiveThumbnail();
  }

  Product.prototype = _.assignIn({}, Product.prototype, {
    _stringOverrides: function() {
      theme.productStrings = theme.productStrings || {};
      $.extend(theme.strings, theme.productStrings);
    },

    _initBreakpoints: function() {
      var self = this;

      enquire.register(this.settings.mediaQuerySmall, {
        match: function() {
          // initialize thumbnail slider on mobile if more than three thumbnails
          if ($(self.selectors.productThumbImages).length > 3) {
            self._initThumbnailSlider();
          }

          // destroy image zooming if enabled
          if (self.settings.zoomEnabled) {
            $(self.selectors.productImageWraps).each(function() {
              _destroyZoom(this);
            });
          }

          self.settings.bpSmall = true;
        },
        unmatch: function() {
          if (self.settings.sliderActive) {
            self._destroyThumbnailSlider();
          }

          self.settings.bpSmall = false;
        }
      });

      enquire.register(this.settings.mediaQueryMediumUp, {
        match: function() {
          if ($(self.selectors.productThumbImages).length > 3) {
            self._initThumbnailSlider();
          }
          if (self.settings.zoomEnabled) {
            $(self.selectors.productImageWraps).each(function() {
              _enableZoom(this);
            });
          }
        }
      });
    },

    _initVariants: function() {
      var options = {
        $container: this.$container,
        enableHistoryState:
          this.$container.data('enable-history-state') || false,
        singleOptionSelector: this.selectors.singleOptionSelector,
        originalSelectorId: this.selectors.originalSelectorId,
        product: this.productSingleObject
      };

      this.variants = new slate.Variants(options);

      this.$container.on(
        'variantChange' + this.settings.namespace,
        this._updateAddToCart.bind(this)
      );
      this.$container.on(
        'variantImageChange' + this.settings.namespace,
        this._updateImages.bind(this)
      );
      this.$container.on(
        'variantPriceChange' + this.settings.namespace,
        this._updatePrice.bind(this)
      );
      this.$container.on(
        'variantSKUChange' + this.settings.namespace,
        this._updateSKU.bind(this)
      );
    },

    _initImageSwitch: function() {
      if (!$(this.selectors.productThumbImages).length) {
        return;
      }

      var self = this;

      $(this.selectors.productThumbImages).on('click', function(evt) {
        evt.preventDefault();
        var $el = $(this);

        var imageId = $el.data('thumbnail-id');

        self._switchImage(imageId);
        self._setActiveThumbnail(imageId);
      });
    },

    _setActiveThumbnail: function(imageId) {
      var activeClass = 'active-thumb';

      // If there is no element passed, find it by the current product image
      if (typeof imageId === 'undefined') {
        imageId = $(this.selectors.productImageWraps + ":not('.hide')").data(
          'image-id'
        );
      }

      var $thumbnail = $(
        this.selectors.productThumbImages +
          "[data-thumbnail-id='" +
          imageId +
          "']"
      );
      $(this.selectors.productThumbImages).removeClass(activeClass);
      $thumbnail.addClass(activeClass);
    },

    _switchImage: function(imageId) {
      var $newImage = $(
        this.selectors.productImageWraps + "[data-image-id='" + imageId + "']",
        this.$container
      );
      var $otherImages = $(
        this.selectors.productImageWraps +
          ":not([data-image-id='" +
          imageId +
          "'])",
        this.$container
      );
      $newImage.removeClass('hide');
      $otherImages.addClass('hide');
    },

    _initThumbnailSlider: function() {
      var options = {
        slidesToShow: 4,
        slidesToScroll: 1,
        infinite: false,
        prevArrow: '.thumbnails-slider__prev--' + this.settings.sectionId,
        nextArrow: '.thumbnails-slider__next--' + this.settings.sectionId,
        responsive: [
          {
            breakpoint: 321,
            settings: {
              slidesToShow: 3
            }
          }
        ]
      };

      $(this.selectors.productThumbs).not('.slick-initialized').slick(options);
      this.settings.sliderActive = true;
    },

    _destroyThumbnailSlider: function() {
      $(this.selectors.productThumbs).slick('unslick');
      this.settings.sliderActive = false;
    },

    _updateAddToCart: function(evt) {
      var variant = evt.variant;

      if (variant) {
        $(this.selectors.productPrices)
          .removeClass('visibility-hidden')
          .attr('aria-hidden', 'true');

        if (variant.available) {
          $(this.selectors.addToCart).prop('disabled', false);
          $(this.selectors.addToCartText).text(theme.strings.addToCart);
        } else {
          // The variant doesn't exist, disable submit button and change the text.
          // This may be an error or notice that a specific variant is not available.
          $(this.selectors.addToCart).prop('disabled', true);
          $(this.selectors.addToCartText).text(theme.strings.soldOut);
        }


        $('.js-inputships').removeAttr("name", "properties[Estimated shipping date]");
        $('.js-inputships[data-variant-days="' + variant.id + '"]').attr("name", "properties[Estimated shipping date]");

      } else {
		
        $(this.selectors.addToCart).prop('disabled', true);
        $(this.selectors.addToCartText).text(theme.strings.unavailable);
        $(this.selectors.productPrices)
          .addClass('visibility-hidden')
          .attr('aria-hidden', 'false');
      }
    },

    _updateImages: function(evt) {
      var variant = evt.variant;
      var imageId = variant.featured_image.id;

      this._switchImage(imageId);
      this._setActiveThumbnail(imageId);
    },

    _updatePrice: function(evt) {
      var variant = evt.variant;

      // Update the product price
      $(this.selectors.originalPrice).html(
        theme.Currency.formatMoney(variant.price, theme.moneyFormat)
      );

      // Update and show the product's compare price if necessary
      if (variant.compare_at_price > variant.price) {
        $(this.selectors.comparePrice)
          .html(
            theme.Currency.formatMoney(
              variant.compare_at_price,
              theme.moneyFormat
            )
          )
          .removeClass('hide');

        $(this.selectors.originalPriceWrapper).addClass(
          this.selectors.saleClasses
        );

        $(this.selectors.saleLabel).removeClass('hide');
      } else {
        $(this.selectors.comparePrice).addClass('hide');
        $(this.selectors.saleLabel).addClass('hide');
        $(this.selectors.originalPriceWrapper).removeClass(
          this.selectors.saleClasses
        );
      }
    },

    _updateSKU: function(evt) {
      var variant = evt.variant;

      // Update the sku
      $(this.selectors.SKU).html(variant.sku);
    },

    onUnload: function() {
      this.$container.off(this.settings.namespace);
    }
  });

  function _enableZoom(el) {
    var zoomUrl = $(el).data('zoom');
    $(el).zoom({
      url: zoomUrl
    });
  }

  function _destroyZoom(el) {
    $(el).trigger('zoom.destroy');
  }

  return Product;
})();

theme.Quotes = (function() {
  var config = {
    mediaQuerySmall: 'screen and (max-width: 749px)',
    mediaQueryMediumUp: 'screen and (min-width: 750px)',
    slideCount: 0
  };
  var defaults = {
    accessibility: true,
    arrows: false,
    dots: true,
    autoplay: false,
    touchThreshold: 20,
    slidesToShow: 3,
    slidesToScroll: 1
  };

  function Quotes(container) {
    var $container = (this.$container = $(container));
    var sectionId = $container.attr('data-section-id');
    var wrapper = (this.wrapper = '.quotes-wrapper');
    var slider = (this.slider = '#Quotes-' + sectionId);
    var $slider = $(slider, wrapper);

    var sliderActive = false;
    var mobileOptions = $.extend({}, defaults, {
      slidesToShow: 1,
      slidesToScroll: 1,
      adaptiveHeight: true
    });

    config.slideCount = $slider.data('count');

    // Override slidesToShow/Scroll if there are not enough blocks
    if (config.slideCount < defaults.slidesToShow) {
      defaults.slidesToShow = config.slideCount;
      defaults.slidesToScroll = config.slideCount;
    }

    $slider.on('init', this.a11y.bind(this));

    enquire.register(config.mediaQuerySmall, {
      match: function() {
        initSlider($slider, mobileOptions);
      }
    });

    enquire.register(config.mediaQueryMediumUp, {
      match: function() {
        initSlider($slider, defaults);
      }
    });

    function initSlider(sliderObj, args) {
      if (sliderActive) {
        sliderObj.slick('unslick');
        sliderActive = false;
      }

      sliderObj.slick(args);
      sliderActive = true;
    }
  }

  Quotes.prototype = _.assignIn({}, Quotes.prototype, {
    onUnload: function() {
      enquire.unregister(config.mediaQuerySmall);
      enquire.unregister(config.mediaQueryMediumUp);

      $(this.slider, this.wrapper).slick('unslick');
    },

    onBlockSelect: function(evt) {
      // Ignore the cloned version
      var $slide = $(
        '.quotes-slide--' + evt.detail.blockId + ':not(.slick-cloned)'
      );
      var slideIndex = $slide.data('slick-index');

      // Go to selected slide, pause autoplay
      $(this.slider, this.wrapper).slick('slickGoTo', slideIndex);
    },

    a11y: function(event, obj) {
      var $list = obj.$list;
      var $wrapper = $(this.wrapper, this.$container);

      // Remove default Slick aria-live attr until slider is focused
      $list.removeAttr('aria-live');

      // When an element in the slider is focused set aria-live
      $wrapper.on('focusin', function(evt) {
        if ($wrapper.has(evt.target).length) {
          $list.attr('aria-live', 'polite');
        }
      });

      // Remove aria-live
      $wrapper.on('focusout', function(evt) {
        if ($wrapper.has(evt.target).length) {
          $list.removeAttr('aria-live');
        }
      });
    }
  });

  return Quotes;
})();

theme.slideshows = {};

theme.SlideshowSection = (function() {
  function SlideshowSection(container) {
    var $container = (this.$container = $(container));
    var sectionId = $container.attr('data-section-id');
    var slideshow = (this.slideshow = '#Slideshow-' + sectionId);

    $('.slideshow__video', slideshow).each(function() {
      var $el = $(this);
      theme.SlideshowVideo.init($el);
      theme.SlideshowVideo.loadVideo($el.attr('id'));
    });

    theme.slideshows[slideshow] = new theme.Slideshow(slideshow);
  }

  return SlideshowSection;
})();

theme.SlideshowSection.prototype = _.assignIn(
  {},
  theme.SlideshowSection.prototype,
  {
    onUnload: function() {
      delete theme.slideshows[this.slideshow];
    },

    onBlockSelect: function(evt) {
      var $slideshow = $(this.slideshow);

      // Ignore the cloned version
      var $slide = $(
        '.slideshow__slide--' + evt.detail.blockId + ':not(.slick-cloned)'
      );
      var slideIndex = $slide.data('slick-index');

      // Go to selected slide, pause autoplay
      $slideshow.slick('slickGoTo', slideIndex).slick('slickPause');
    },

    onBlockDeselect: function() {
      // Resume autoplay
      $(this.slideshow).slick('slickPlay');
    }
  }
);


$(document).ready(function() {
  var sections = new theme.Sections();

  sections.register('cart-template', theme.Cart);
  sections.register('product', theme.Product);
  sections.register('collection-template', theme.Filters);
  sections.register('product-template', theme.Product);
  sections.register('header-section', theme.HeaderSection);
  sections.register('map', theme.Maps);
  sections.register('slideshow-section', theme.SlideshowSection);
  sections.register('quotes', theme.Quotes);
});

theme.init = function() {
  theme.customerTemplates.init();

  // Theme-specific selectors to make tables scrollable
  var tableSelectors = '.rte table,' + '.custom__item-inner--html table';

  slate.rte.wrapTable({
    $tables: $(tableSelectors),
    tableWrapperClass: 'scrollable-wrapper'
  });

  // Theme-specific selectors to make iframes responsive
  var iframeSelectors =
    '.rte iframe[src*="youtube.com/embed"],' +
    '.rte iframe[src*="player.vimeo"],' +
    '.custom__item-inner--html iframe[src*="youtube.com/embed"],' +
    '.custom__item-inner--html iframe[src*="player.vimeo"]';

  slate.rte.wrapIframe({
    $iframes: $(iframeSelectors),
    iframeWrapperClass: 'video-wrapper'
  });

  // Common a11y fixes
  slate.a11y.pageLinkFocus($(window.location.hash));

  $('.in-page-link').on('click', function(evt) {
    slate.a11y.pageLinkFocus($(evt.currentTarget.hash));
  });

  $('a[href="#"]').on('click', function(evt) {
    evt.preventDefault();
  });

  // product tab
  $('.product-tab ul li a[href="#"]').on('click', function(tp) {
    tp.preventDefault();
    var datatab = $(this).data("tab");
    $('.product-tab ul li').removeClass('active');
    $(this).parent('li').addClass('active');
    $('.ctab').hide();
    $('.' + datatab).show();
  });


  // Page - Rewards
  $('.link-accordion').on('click', function() {
    var dataaccordion = $(this).data("accordion");
    $(this).toggleClass('active');
    $('.' + dataaccordion).toggleClass('active');
  });

  // Wishlist
  jQuery("a[href='/apps/iwish']").click(function(e) {
    if(typeof(Storage) !== "undefined") {
      e.preventDefault();
      iWishPost('/apps/iwish',{iwishlist:JSON.stringify(iWishlistmain),cId:iwish_cid});
    }
  });
  jQuery(".iWishAdd").click(function() {
    var iWishvId = jQuery(this).parents(iwishWrapperClass).find(iWishVarSelector).val();
    iwish_add(jQuery(this), iWishvId);
    return false;
  });
  jQuery(".iWishAddColl").click(function() {
    var iWishvId = jQuery(this).attr("data-variant");
    iwish_addCollection(jQuery(this),iWishvId);
    return false;
  });
  //iwishCheckColl();

  // Wishlist
  /*function iwishCheckColl(){
    if(jQuery(".iwishcheck").length > 0) {
      jQuery(".iwishcheck").each(function() {
        var iWishvId = jQuery(this).attr("data-variant");
        var iWishpId = jQuery(this).attr("data-product");
        if(isInWishlist(iWishpId,iWishvId)){ jQuery(this).addClass("iwishAdded").find('span').text(iwish_added_txt_col); }
        jQuery(this).removeClass("iwishcheck");
      });
    }
  }*/

  // Ajax cart

  $(".add-success .content .action .btn.continue").click(function(){
    $(".add-success").hide();
    //location.reload(true);
  });

  $(".site-header__cart").click(function(e){
    e.preventDefault();
    //$(".cart-box").fadeToggle();
    $(".cart-box").animate({
      marginRight: 0
    });
    $("body").addClass('active-panel');
  });



  // Main Menu mouseenter event

  var isMenuHovered;
  var isSubMenuHovered;
  var showNav;
  $(".site-nav__link--main").mouseenter(function() {
    isMenuHovered = true;
    var self = this;
    showNav = setTimeout(function() {
      $(".site-nav__dropdown").hide().removeClass("active_div");
      var sTarget = $(self).parent().attr("aria-controls");
      $('#' + sTarget).show().addClass("active_div");
      $(".site-nav--has-dropdown").removeClass("site-nav--active-dropdown");
      $(self).parent().addClass("site-nav--active-dropdown");
    }, 300);
  });


  // Main Menu mouseleave event

  $(".site-nav__link--main").mouseleave(function() {
    isMenuHovered = false;
    setTimeout(function() {
      if (!isSubMenuHovered) {
        $('.site-nav__dropdown').hide().removeClass("active_div site-nav--active-dropdown");
      }
    }, 300);
  });

  // Dropdown Menu mouseenter event

  $(".site-nav__childlist").mouseenter(function() {
    isSubMenuHovered = true;
  });


  // Dropdown Menu mouseleave event

  $(".site-nav__childlist").mouseleave(function() {
    isSubMenuHovered = false;
    var self = this;
    setTimeout(function() {
      if (!isMenuHovered) {
        $(self).parents(".site-nav__dropdown").hide().removeClass("active_div site-nav--active-dropdown");
      }
    }, 300);
  });


//    if(  $(".cart-mini-note-action input").val().length === 0 ) {
//     $(".cart-mini-note-link").show();
//     $(".cart-mini-note-action").hide();
//     $(".mini-cart form").removeClass("calc-height");
//     $(".note-option").hide();
//   } else {
//     $(".cart-mini-note-link, .note-edit").hide();
//     $(".cart-mini-note-action, .note-preview").show();
//     $(".mini-cart form").addClass("calc-height");
//     $(".note-option").show();
//   }

};

$(window).on('load',function() {
  	$("#SingleOptionSelector-0").trigger("change");

});

$(theme.init);

// Ajax cart
if ((typeof Shopify) === 'undefined') { Shopify = {}; }
Shopify.getCart = Shopify.getCart || function(callback) {
  jQuery.getJSON('/cart.js', function (cart, textStatus) {
    if ((typeof callback) === 'function') {
      callback(cart);
    }
    else if(typeof Shopify.onCartUpdate ==='function') {
      Shopify.onCartUpdate(cart);
    }
  });
};

function addItemFromForm(t){
  $.ajax({
    type: 'POST',
    url: '/cart/add.js',
    dataType: 'json',
    beforeSend: function() {
      $(".loading-modalx").show();
    },
    data:  $("#"+t).serialize(),
    success: getcart,
    error: errorinfo
  });

}

function updateItemFromForm(idx,qty){
  data = {
    "quantity": qty,
    "id": idx
  }

  $.ajax({
    url: '/cart/update.js',
    type: 'POST',
    dataType: 'json',
    data: {
      note: $(".note-text").val()
    },
    success: function(response) {
      $('.site-header__cart-count, .mini-cart-count-panel').html('<span>' + response.item_count + '</span>');
      var titles = response.total_price / 100;
      var title2 = titles.toFixed(2);
      $('.woocommerce-Price-amount').html('$' + title2 );

      if ( response.item_count == 0  ){
        $('.mini-cart .has-item, .cart-mini-bottom').hide();
        $('.mini-cart form').html('<div class="content no-item">Your cart is currently empty.</div>');
        $('.mini-cart form').css('padding-top', '0px');
      }
    },
    error: function(jqxhr, status, exception) {
      //console.log(exception);
    }
  });


  if($(".note-text").val().length === 0){
	$(".cart-mini-note-link").show();
	$(".cart-mini-note-action, .note-option").hide();
    $(".note-option a:first-child").text("Edit");
    $(".mini-cart form").removeClass("calc-height");
  } else {
    $(".note-preview").text($(".note-text").val());
    $(".note-edit").hide();
    $(".note-preview, .note-option").show();
    $(".note-option a:first-child").text("Edit");
    $(".mini-cart form").addClass("calc-height");
  }
}


function getcart(){
  $.ajax({
    type: 'GET',
    url: '/cart.js',
    dataType: 'json',
    success: function(response)
    {
      $(".loading-modalx").hide();
      $('.site-header__cart-count, .mini-cart-count-panel').html('<span>' + response.item_count + '</span>');
      autoCloseCartHandler();
    },
    error: errorinfo
  });

  $(".cart-box").load("/cart .mini-cart", function() {
    $(".cart-box").animate({
      marginRight: 0
    });
    $("body").addClass('active-panel');
  });
}

function autoCloseCartHandler() {
  //console.log("autoclose theme.js");
  function close() {
    //console.log("close");
    $(".cart-box").animate({
      marginRight: "-100%"
    });
    $("body").removeClass('active-panel');
  }
  var timer = setTimeout(close, 8000);
  $(".cart-box").click(function () {
    clearTimeout(timer);
    timer = setTimeout(close, 8000);
  })
  $(".cart-box").on("input", ".note-text", function () {
    clearTimeout(timer);
    timer = setTimeout(close, 8000);
  })
}

function errorinfo(obj){
  $(".ajax-error-message").text($.parseJSON(obj.responseText).description);
  try {
    // $(error_div).html(obj.description).fadeIn(300).delay(show_msg_delay).fadeOut(300);
  } catch(e) {
    // $(error_div).html("There was an error").fadeIn(300).delay(show_msg_delay).fadeOut(300);
  }
}

//Modify numeric input amounts, update cart if variant ID supplied
function modifyQuantity(sel, amt, varID) {
  var curr = parseInt($(sel).val());
  if(curr == NaN) {
    curr == 0;
  }

  var newVal = Math.max(0, curr+amt);
  $(sel).val(newVal);

  if(newVal === 0){
    $(sel).parents('.cart-mini-item').remove();
  }

  function updateCart(jqXHR, data) {
    if(jqXHR.statusText != 'OK') {
      // $(error_div).html("There was an error").fadeIn(300).delay(show_msg_delay).fadeOut(300);
      //alert('There was a small problem updating the cart. Please use the Update button.');
    }
    if(typeof(data) == 'undefined') {
      data = eval('(' + jqXHR.responseText + ')');
    }

    var totalString = Shopify.formatMoney(data.total_price);
    $('.for-update_' + varID).parents('.sub-qty').find('.pop-update').click();
    $('.site-header__cart-count, .mini-cart-count-panel').html('<span>' + data.item_count + '</span>');
    $('.woocommerce-Price-amount').text(totalString);
    for(i=0; i<data.items.length; i++) {
      if(data.items[i].id == varID) {
        $('#row_amt_' + varID).html(Shopify.formatMoney(data.items[i].line_price));
      }
    }
  }
  if(typeof(varID) != 'undefined') {
     
    var jqxhr = $.post('/cart/change.js', { 'quantity':newVal, 'id':varID }, function(data, textStatus, jqXHR) {
      updateCart(jqXHR, data);
    }, 'json').fail(function(jqXHR){
      updateCart(jqXHR);
    });
  }

  Shopify.getCart(updateItemFromForm);
}

function removeThis(sel,amt) {

  var curr = parseInt($(sel).val());
  if(curr == NaN) {
    curr == 0;
  }

  var newVal = Math.max(0, curr*amt);
  $(sel).val(newVal);

  var cRemove = $(sel).data('remove');
  //alert(cRemove);
  jQuery.post('/cart/update.js', 'updates['+cRemove+']=0');
  jQuery('.remove-' + cRemove).remove();
  Shopify.getCart(updateItemFromForm);
}

function close_window() {
  //close();
  //$(".cart-box").fadeOut();
  $(".cart-box").animate({
    marginRight: "-100%"
  });
  $("body").removeClass('active-panel');
}

function add_note() {
  $(".cart-mini-note-action").show();
  $(".cart-mini-note-link").hide();
  $(".mini-cart form").addClass("calc-height");
}

function option_edit() {
  $(".note-edit").toggle();
  $(".note-preview").toggle();
  $(".note-option a:first-child").text(function(i, text){
    return text === "Edit" ? "Cancel" : "Edit";
  });
}

function option_remove() {
  $(".note-text").attr('value', '');
  $(".note-save").click();
  $(".note-preview").text('');
  $(".note-save").click();
}




$(document).ready(function () {
  $('#MobileNav').find('.accordion-trigger').click(function() {
    //Expand or collapse this panel
    $(this).next().slideToggle('fast');

    //Hide the other panels
    $(".accordion-content").not($(this).next()).slideUp('fast');
  });

  $('#MobileNav').find('.accordion-trigger2').click(function() {
    //Expand or collapse this panel
    $(this).next().slideToggle('fast');

    //Hide the other panels
    $(".accordion-content2").not($(this).next()).slideUp('fast');
  });

  // feature: Opening Instagram in new window
  (function () {
    var linkSelector = '[data-new-window]';

    function PopupCenter(url, title, w, h) {
      var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : window.screenX;
      var dualScreenTop = window.screenTop != undefined ? window.screenTop : window.screenY;

      var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
      var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

      var systemZoom = width / window.screen.availWidth;
      var left = (width - w) / 2 / systemZoom + dualScreenLeft
      var top = (height - h) / 2 / systemZoom + dualScreenTop
      var newWindow = window.open(url, title, 'scrollbars=yes, width=' + w / systemZoom + ', height=' + h / systemZoom + ', top=' + top + ', left=' + left);

      // Puts focus on the newWindow
      if (window.focus) newWindow.focus();
    }
    $(linkSelector).click(function () {
      var url = $(this).data('new-window');
      PopupCenter(url, '', 1000, 600);
    })
  })();
  // end feature

  // feature smart search results algorithm
  (function () {
    var keyword;
    // when a keyword is entered in the search box
    $('.search-header').on('submit', function (e) {
      // prevent the page from reloading with the default Shopify search term results
      e.preventDefault();

      // get search term entered by user
      keyword = $(this).find('.search-header__input').val().toLowerCase();

      // check keyword in our database
      ajaxSearch();
    });

    // when a predefined search keyword is clicked
    $('.search-header__keyword-link').click(function(e) {
      // disable default click event
      e.preventDefault();

      // get the clicked search term
      keyword = $(this).attr('href').split('=')[1];

      // check keyword in our database
      ajaxSearch();
    });

    function ajaxSearch() {
      // make AJAX call to our CSV file
      $.ajax({
        url: 'https://cdn.shopify.com/s/files/1/2395/3423/files/Search_Term_Redirects_2.csv?53049',
        dataType: 'text',
      })
        .done(successFunction) // if AJAX call succeeds
        .fail(function() { // if AJAX call fails, load the default search page with the search term
          window.location.href = '/search?type=product&q=' + keyword;
        });
    }

    function successFunction(data) {
      var keywordMatched = false;
      var url = '';

      // AJAX call result formatted into array of rows
      var allRows = data.split(/\r?\n|\r/);

      // iterate through each row
      for (var singleRow = 0; singleRow < allRows.length; singleRow++) {
        // each row formatted into array of columns/cells
        var rowCells = allRows[singleRow].split(',');

        // iterate through each column/cell of the current row
        for (var rowCell = 1; rowCell < rowCells.length; rowCell++) {
          // if match found, break the loop of columns/cells array and save the URL
          if (rowCells[rowCell].toLowerCase() === keyword) {
            url = rowCells[0];
            keywordMatched = true;
            break;
          }
        }

        // if match found, break the loop of rows array
        if (keywordMatched) {
          break;
        }
      }

      // if match found, redirect to the collection URL saved earlier
      if (url !== '') {
        window.location.href = url;
      } else { // if match not found, load the default search page with the search term
        window.location.href = '/search?type=product&q=' + keyword;
      }
    }
  })();
  // end feature

  // feature: Footer Accordion in mobile:
  (function () {
    if ($(window).width() < 768) {
      $('footer h4').on('click', function () {
        $(this).toggleClass('opened');
        $(this).next().slideToggle('fast');
      });
    }
  })();
  // end feature

  // feature: underline for rte links which doesn't contains images
  (function () {
    $('.rte a:not(:has(img))').each(function (index, element) {
      $(element).addClass('a--underline')
    });
  })();
  // end feature
});

// Mobile Product Image Slider
(function () {
	
//console.log("test");
//console.log($(window).width());
        if ($(window).width() <= 980) {
			/* eslint-disable no-new */
			theme.Product = (function() {
			  function Product(container) {
				var $container = (this.$container = $(container));
				var sectionId = $container.attr('data-section-id');
				this.ajaxEnabled = $container.data('ajax-enabled');

				this.settings = {
				  // Breakpoints from src/stylesheets/global/variables.scss.liquid
				  mediaQueryMediumUp: 'screen and (min-width: 750px)',
				  mediaQuerySmall: 'screen and (max-width: 749px)',
				  bpSmall: false,
				  enableHistoryState: $container.data('enable-history-state') || false,
				  namespace: '.slideshow-' + sectionId,
				  sectionId: sectionId,
				  sliderActive: false,
				  zoomEnabled: false
				};

				this.selectors = {
				  addToCart: '[data-add-to-cart]',
				  addToCartText: '[data-add-to-cart-text]',
				  cartCount: '[data-cart-count]',
				  cartCountBubble: '[data-cart-count-bubble]',
				  cartPopup: '[data-cart-popup]',
				  cartPopupCartQuantity: '[data-cart-popup-cart-quantity]',
				  cartPopupClose: '[data-cart-popup-close]',
				  cartPopupDismiss: '[data-cart-popup-dismiss]',
				  cartPopupImage: '[data-cart-popup-image]',
				  cartPopupImageWrapper: '[data-cart-popup-image-wrapper]',
				  cartPopupImagePlaceholder: '[data-cart-popup-image-placeholder]',
				  cartPopupPlaceholderSize: '[data-placeholder-size]',
				  cartPopupProductDetails: '[data-cart-popup-product-details]',
				  cartPopupQuantity: '[data-cart-popup-quantity]',
				  cartPopupQuantityLabel: '[data-cart-popup-quantity-label]',
				  cartPopupTitle: '[data-cart-popup-title]',
				  cartPopupWrapper: '[data-cart-popup-wrapper]',
				  loader: '[data-loader]',
				  loaderStatus: '[data-loader-status]',
				  quantity: '[data-quantity-input]',
				  SKU: '.variant-sku',
				  productStatus: '[data-product-status]',
				  originalSelectorId: '#ProductSelect-' + sectionId,
				  productForm: '[data-product-form]',
				  errorMessage: '[data-error-message]',
				  errorMessageWrapper: '[data-error-message-wrapper]',
				  productImageWraps: '.product-single__photo',
				  productThumbImages: '.product-single__thumbnail--' + sectionId,
				  productThumbs: '.product-single__thumbnails-' + sectionId,
				  productThumbListItem: '.product-single__thumbnails-item',
				  productFeaturedImage: '.product-featured-img',
				  productThumbsWrapper: '.thumbnails-wrapper',
				  saleLabel: '.product-price__sale-label-' + sectionId,
				  singleOptionSelector: '.single-option-selector-' + sectionId,
				  shopifyPaymentButton: '.shopify-payment-button',
				  priceContainer: '[data-price]',
				  regularPrice: '[data-regular-price]',
				  salePrice: '[data-sale-price]',
				  unitPrice: '[data-unit-price]',
				  unitPriceBaseUnit: '[data-unit-price-base-unit]',
				  productPrices: '.product-single__price-' + sectionId,
				  addToCartmobile: '#AddToCart-' + sectionId,
				  addToCartTextmobile: '#AddToCartText-' + sectionId,
				  originalPrice: '#ProductPrice-' + sectionId,
				};

				this.classes = {
				  cartPopupWrapperHidden: 'cart-popup-wrapper--hidden',
				  hidden: 'hide',
				  inputError: 'input--error',
				  productOnSale: 'price--on-sale',
				  productUnitAvailable: 'price--unit-available',
				  productUnavailable: 'price--unavailable',
				  cartImage: 'cart-popup-item__image',
				  productFormErrorMessageWrapperHidden:
					'product-form__error-message-wrapper--hidden',
				  activeClass: 'active-thumb'
				};

				this.$quantityInput = $(this.selectors.quantity, $container);
				this.$errorMessageWrapper = $(
				  this.selectors.errorMessageWrapper,
				  $container
				);
				this.$addToCart = $(this.selectors.addToCart, $container);
				this.$addToCartText = $(this.selectors.addToCartText, this.$addToCart);
				this.$shopifyPaymentButton = $(
				  this.selectors.shopifyPaymentButton,
				  $container
				);

				this.$loader = $(this.selectors.loader, this.$addToCart);
				this.$loaderStatus = $(this.selectors.loaderStatus, $container);

				// Stop parsing if we don't have the product json script tag when loading
				// section in the Theme Editor
				if (!$('#ProductJson-' + sectionId).html()) {
				  return;
				}

				this.productSingleObject = JSON.parse(
				  document.getElementById('ProductJson-' + sectionId).innerHTML
				);

				this.settings.zoomEnabled = $(this.selectors.productImageWraps).hasClass(
				  'js-zoom-enabled'
				);

				this._initBreakpoints();
				this._stringOverrides();
				this._initVariants();
				this._initImageSwitch();
				this._initAddToCart();
				this._setActiveThumbnail();
				//init slide swipe properites/call init method
				this.mouseXDown = 0;
				this.mouseXUp = 0;
				this.touchEnd = true;
				this.activeSlide = 0;
				this.imageWrappers = $(this.selectors.productImageWraps);
				this.featuredImages = $(this.selectors.productFeaturedImage);
				this.initImageListener();
			  }
			  //mjp functions for mouse swipe
			  Product.prototype.initImageListener = function(){
				for(var i = 0;i < this.featuredImages.length;i++){
				  $(this.featuredImages[i]).bind('mousedown',function(e){
					this.imageClickDown(e);
				  }.bind(this));
				  
				  $(this.featuredImages[i]).bind('mouseup',function(e){
					this.imageClickUp(e);
				  }.bind(this));
				  
				  $(this.featuredImages[i]).bind('touchstart',function(e){
					this.touchEnd = false;
				   // e.preventDefault();
					this.imageClickDown(e);
				  }.bind(this));
				  $(this.featuredImages[i]).bind('touchmove',function(e){
					//e.preventDefault();
					this.imageClickUp(e);
				  }.bind(this));
				  
				  $(this.featuredImages[i]).bind('touchend',function(e){  
					this.touchEnd = true;
					this.imageSwitchMobile();
					//will actually need to call the slide change here
				  }.bind(this));
				  //prevent image drag
				  $(this.featuredImages[i]).on('dragstart', function(event) { event.preventDefault(); });
				  
				}
			  };
				
			  Product.prototype.imageClickDown = function(e){
				this.mouseXDown = e.clientX !== undefined ? e.clientX : e.originalEvent.touches[0].clientX;
			 
			  };
			  
			  Product.prototype.imageSwitchMobile = function(){
				var xDiff = this.mouseXDown - this.mouseXUp;
				if(xDiff >= 120 && this.touchEnd){
				  if(this.activeSlide !== this.featuredImages.length - 1){
					var imageId = this.featuredImages[this.activeSlide + 1].id.split('-');
					var nextImageId = imageId[imageId.length - 1];
					this._switchImage(nextImageId);
					this._setActiveThumbnail(nextImageId);
				  }
				}
				//to prev image
				else if(xDiff <= -120 && this.touchEnd){
				  if(this.activeSlide !== 0){
					var imageId = this.featuredImages[this.activeSlide - 1].id.split('-');
					var nextImageId = imageId[imageId.length - 1];
					this._switchImage(nextImageId);
					this._setActiveThumbnail(nextImageId);
				  }
				 
				}
			  };
			  
			  Product.prototype.imageClickUp = function(e){
				this.mouseXUp = e.clientX ? e.clientX : e.originalEvent.touches[0].clientX;
				var xDiff = this.mouseXDown - this.mouseXUp;
				//to next image
				if(xDiff >= 120 && this.touchEnd){
				  if(this.activeSlide !== this.featuredImages.length - 1){
					var imageId = this.featuredImages[this.activeSlide + 1].id.split('-');
					var nextImageId = imageId[imageId.length - 1];
					this._switchImage(nextImageId);
					this._setActiveThumbnail(nextImageId);
				  }
				}
				//to prev image
				else if(xDiff <= -120 && this.touchEnd){
				  if(this.activeSlide !== 0){
					var imageId = this.featuredImages[this.activeSlide - 1].id.split('-');
					var nextImageId = imageId[imageId.length - 1];
					this._switchImage(nextImageId);
					this._setActiveThumbnail(nextImageId);
				  }
				 
				}
			  };
			  
			  Product.prototype.setActiveImageIndex = function(){
				for(let i = 0;i < this.imageWrappers.length;i++){
				  if(!this.imageWrappers[i].classList.contains('hide')){
					this.activeSlide = i;
					return;
				  }
				}
			  };
			  
			  Product.prototype = _.assignIn({}, Product.prototype, {
				_stringOverrides: function() {
				  theme.productStrings = theme.productStrings || {};
				  $.extend(theme.strings, theme.productStrings);
				},

				_initBreakpoints: function() {
				  var self = this;

				  enquire.register(this.settings.mediaQuerySmall, {
					match: function() {
					  // initialize thumbnail slider on mobile if more than three thumbnails
					  if ($(self.selectors.productThumbImages).length > 3) {
						self._initThumbnailSlider();
					  }

					  // destroy image zooming if enabled
					  if (self.settings.zoomEnabled) {
						$(self.selectors.productImageWraps).each(function() {
						  _destroyZoom(this);
						});
					  }

					  self.settings.bpSmall = true;
					},
					unmatch: function() {
					  if (self.settings.sliderActive) {
						self._destroyThumbnailSlider();
					  }

					  self.settings.bpSmall = false;
					}
				  });

				  enquire.register(this.settings.mediaQueryMediumUp, {
					match: function() {
					  if (self.settings.zoomEnabled) {
						$(self.selectors.productImageWraps).each(function() {
						  _enableZoom(this);
						});
					  }
					}
				  });
				},

				_initVariants: function() {
				  var options = {
					$container: this.$container,
					enableHistoryState:
					  this.$container.data('enable-history-state') || false,
					singleOptionSelector: this.selectors.singleOptionSelector,
					originalSelectorId: this.selectors.originalSelectorId,
					product: this.productSingleObject
				  };

				  this.variants = new slate.Variants(options);

				  this.$container.on(
					'variantChange' + this.settings.namespace,
					this._updateAvailability.bind(this)
				  );
				  this.$container.on(
					'variantImageChange' + this.settings.namespace,
					this._updateImages.bind(this)
				  );
				  this.$container.on(
					'variantPriceChange' + this.settings.namespace,
					this._updatePrice.bind(this)
				  );
				  this.$container.on(
					'variantSKUChange' + this.settings.namespace,
					this._updateSKU.bind(this)
				  );
				},

				_initImageSwitch: function() {
				  if (!$(this.selectors.productThumbImages).length) {
					return;
				  }

				  var self = this;

				  $(this.selectors.productThumbImages)
					.on('click', function(evt) {
					  evt.preventDefault();
					  var $el = $(this);

					  var imageId = $el.data('thumbnail-id');

					  self._switchImage(imageId);
					  self._setActiveThumbnail(imageId);
					})
					.on('keyup', self._handleImageFocus.bind(self));
				},

				_initAddToCart: function() {
				  $(this.selectors.productForm, this.$container).on(
					'submit',
					function(evt) {
					  evt.preventDefault();

					  if (this.$addToCart.is('[aria-disabled]')) {
						return;
					  }

					  this.$previouslyFocusedElement = $(':focus');

					  var isInvalidQuantity = this.$quantityInput.val() <= 0;

					  if (isInvalidQuantity) {
						this._showErrorMessage(theme.strings.quantityMinimumMessage);
						return;
					  }

					  if (!isInvalidQuantity && this.ajaxEnabled) {
						// disable the addToCart and dynamic checkout button while
						// request/cart popup is loading and handle loading state
						this._handleButtonLoadingState(true);
						var $data = $(this.selectors.productForm, this.$container);
						this._addItemToCart($data);
						return;
					  }

					  if (!isInvalidQuantity && !this.ajaxEnabled) {
						// submit the product form and get redirected to cart
						evt.target.submit();
					  }
					}.bind(this)
				  );
				},

				_addItemToCart: function(data) {
				  var params = {
					url: '/cart/add.js',
					data: $(data).serialize(),
					dataType: 'json'
				  };

				  $.post(params)
					.done(
					  function(item) {
						this._hideErrorMessage();
						this._setupCartPopup(item);
					  }.bind(this)
					)
					.fail(
					  function(response) {
						this.$previouslyFocusedElement.focus();
						this._showErrorMessage(response.responseJSON.description);
						this._handleButtonLoadingState(false);
					  }.bind(this)
					);
				},

				_handleButtonLoadingState: function(isLoading) {
				  if (isLoading) {
					this.$addToCart.attr('aria-disabled', true);
					this.$addToCartText.addClass(this.classes.hidden);
					this.$loader.removeClass(this.classes.hidden);
					this.$shopifyPaymentButton.attr('disabled', true);
					this.$loaderStatus.attr('aria-hidden', false);
				  } else {
					this.$addToCart.removeAttr('aria-disabled');
					this.$addToCartText.removeClass(this.classes.hidden);
					this.$loader.addClass(this.classes.hidden);
					this.$shopifyPaymentButton.removeAttr('disabled');
					this.$loaderStatus.attr('aria-hidden', true);
				  }
				},

				_showErrorMessage: function(errorMessage) {
				  $(this.selectors.errorMessage, this.$container).html(errorMessage);

				  if (this.$quantityInput.length !== 0) {
					this.$quantityInput.addClass(this.classes.inputError);
				  }

				  this.$errorMessageWrapper
					.removeClass(this.classes.productFormErrorMessageWrapperHidden)
					.attr('aria-hidden', true)
					.removeAttr('aria-hidden');
				},

				_hideErrorMessage: function() {
				  this.$errorMessageWrapper.addClass(
					this.classes.productFormErrorMessageWrapperHidden
				  );

				  if (this.$quantityInput.length !== 0) {
					this.$quantityInput.removeClass(this.classes.inputError);
				  }
				},

				_setupCartPopup: function(item) {
				  this.$cartPopup = this.$cartPopup || $(this.selectors.cartPopup);
				  this.$cartPopupWrapper =
					this.$cartPopupWrapper || $(this.selectors.cartPopupWrapper);
				  this.$cartPopupTitle =
					this.$cartPopupTitle || $(this.selectors.cartPopupTitle);
				  this.$cartPopupQuantity =
					this.$cartPopupQuantity || $(this.selectors.cartPopupQuantity);
				  this.$cartPopupQuantityLabel =
					this.$cartPopupQuantityLabel ||
					$(this.selectors.cartPopupQuantityLabel);
				  this.$cartPopupClose =
					this.$cartPopupClose || $(this.selectors.cartPopupClose);
				  this.$cartPopupDismiss =
					this.cartPopupDismiss || $(this.selectors.cartPopupDismiss);
				  this.$cartPopupImagePlaceholder =
					this.$cartPopupImagePlaceholder ||
					$(this.selectors.cartPopupImagePlaceholder);

				  this._setupCartPopupEventListeners();

				  this._updateCartPopupContent(item);
				},

				_updateCartPopupContent: function(item) {
				  var quantity = this.$quantityInput.length ? this.$quantityInput.val() : 1;

				  this.$cartPopupTitle.text(item.product_title);
				  this.$cartPopupQuantity.text(quantity);
				  this.$cartPopupQuantityLabel.text(
					theme.strings.quantityLabel.replace('[count]', quantity)
				  );

				  this._setCartPopupPlaceholder(
					item.featured_image.url,
					item.featured_image.aspect_ratio
				  );
				  this._setCartPopupImage(item.featured_image.url, item.featured_image.alt);
				  this._setCartPopupProductDetails(
					item.product_has_only_default_variant,
					item.options_with_values,
					item.properties
				  );

				  $.getJSON('/cart.js').then(
					function(cart) {
					  this._setCartQuantity(cart.item_count);
					  this._setCartCountBubble(cart.item_count);
					  this._showCartPopup();
					}.bind(this)
				  );
				},

				_setupCartPopupEventListeners: function() {
				  this.$cartPopupWrapper.on(
					'keyup',
					function(event) {
					  if (event.keyCode === slate.utils.keyboardKeys.ESCAPE) {
						this._hideCartPopup(event);
					  }
					}.bind(this)
				  );

				  this.$cartPopupClose.on('click', this._hideCartPopup.bind(this));
				  this.$cartPopupDismiss.on('click', this._hideCartPopup.bind(this));
				  $('body').on('click', this._onBodyClick.bind(this));
				},

				_setCartPopupPlaceholder: function(imageUrl, imageAspectRatio) {
				  this.$cartPopupImageWrapper =
					this.$cartPopupImageWrapper || $(this.selectors.cartPopupImageWrapper);

				  if (imageUrl === null) {
					this.$cartPopupImageWrapper.addClass(this.classes.hidden);
					return;
				  }

				  var $placeholder = $(this.selectors.cartPopupPlaceholderSize);
				  var maxWidth = 95 * imageAspectRatio;
				  var heightRatio = 100 / imageAspectRatio;

				  this.$cartPopupImagePlaceholder.css('max-width', maxWidth);

				  $placeholder.css('padding-top', heightRatio + '%');
				},

				_setCartPopupImage: function(imageUrl, imageAlt) {
				  if (imageUrl === null) return;

				  this.$cartPopupImageWrapper.removeClass(this.classes.hidden);
				  var sizedImageUrl = theme.Images.getSizedImageUrl(imageUrl, '200x');
				  var image = document.createElement('img');
				  image.src = sizedImageUrl;
				  image.alt = imageAlt;
				  image.classList.add(this.classes.cartImage);
				  image.dataset.cartPopupImage = '';

				  image.onload = function() {
					this.$cartPopupImagePlaceholder.addClass(this.classes.hidden);
					this.$cartPopupImageWrapper.append(image);
				  }.bind(this);
				},

				_setCartPopupProductDetails: function(
				  product_has_only_default_variant,
				  options,
				  properties
				) {
				  this.$cartPopupProductDetails =
					this.$cartPopupProductDetails ||
					$(this.selectors.cartPopupProductDetails);
				  var variantPropertiesHTML = '';

				  if (!product_has_only_default_variant) {
					variantPropertiesHTML =
					  variantPropertiesHTML + this._getVariantOptionList(options);
				  }

				  if (properties !== null && Object.keys(properties).length !== 0) {
					variantPropertiesHTML =
					  variantPropertiesHTML + this._getPropertyList(properties);
				  }

				  if (variantPropertiesHTML.length === 0) {
					this.$cartPopupProductDetails.html('');
					this.$cartPopupProductDetails.attr('hidden', '');
				  } else {
					this.$cartPopupProductDetails.html(variantPropertiesHTML);
					this.$cartPopupProductDetails.removeAttr('hidden');
				  }
				},

				_getVariantOptionList: function(variantOptions) {
				  var variantOptionListHTML = '';

				  variantOptions.forEach(function(variantOption) {
					variantOptionListHTML =
					  variantOptionListHTML +
					  '<li class="product-details__item product-details__item--variant-option">' +
					  variantOption.name +
					  ': ' +
					  variantOption.value +
					  '</li>';
				  });

				  return variantOptionListHTML;
				},

				_getPropertyList: function(properties) {
				  var propertyListHTML = '';
				  var propertiesArray = Object.entries(properties);

				  propertiesArray.forEach(function(property) {
					// Line item properties prefixed with an underscore are not to be displayed
					if (property[0].charAt(0) === '_') return;

					// if the property value has a length of 0 (empty), don't display it
					if (property[1].length === 0) return;

					propertyListHTML =
					  propertyListHTML +
					  '<li class="product-details__item product-details__item--property">' +
					  '<span class="product-details__property-label">' +
					  property[0] +
					  ': </span>' +
					  property[1];
					': ' + '</li>';
				  });

				  return propertyListHTML;
				},

				_setCartQuantity: function(quantity) {
				  this.$cartPopupCartQuantity =
					this.$cartPopupCartQuantity || $(this.selectors.cartPopupCartQuantity);
				  var ariaLabel;

				  if (quantity === 1) {
					ariaLabel = theme.strings.oneCartCount;
				  } else if (quantity > 1) {
					ariaLabel = theme.strings.otherCartCount.replace('[count]', quantity);
				  }

				  this.$cartPopupCartQuantity.text(quantity).attr('aria-label', ariaLabel);
				},

				_setCartCountBubble: function(quantity) {
				  this.$cartCountBubble =
					this.$cartCountBubble || $(this.selectors.cartCountBubble);
				  this.$cartCount = this.$cartCount || $(this.selectors.cartCount);

				  this.$cartCountBubble.removeClass(this.classes.hidden);
				  this.$cartCount.text(quantity);
				},

				_showCartPopup: function() {
				  this.$cartPopupWrapper
					.prepareTransition()
					.removeClass(this.classes.cartPopupWrapperHidden);
				  this._handleButtonLoadingState(false);

				  slate.a11y.trapFocus({
					$container: this.$cartPopupWrapper,
					$elementToFocus: this.$cartPopup,
					namespace: 'cartPopupFocus'
				  });
				},

				_hideCartPopup: function(event) {
				  var setFocus = event.detail === 0 ? true : false;
				  this.$cartPopupWrapper
					.prepareTransition()
					.addClass(this.classes.cartPopupWrapperHidden);

				  $(this.selectors.cartPopupImage).remove();
				  this.$cartPopupImagePlaceholder.removeClass(this.classes.hidden);

				  slate.a11y.removeTrapFocus({
					$container: this.$cartPopupWrapper,
					namespace: 'cartPopupFocus'
				  });

				  if (setFocus) this.$previouslyFocusedElement[0].focus();

				  this.$cartPopupWrapper.off('keyup');
				  this.$cartPopupClose.off('click');
				  this.$cartPopupDismiss.off('click');
				  $('body').off('click');
				},

				_onBodyClick: function(event) {
				  var $target = $(event.target);

				  if (
					$target[0] !== this.$cartPopupWrapper[0] &&
					!$target.parents(this.selectors.cartPopup).length
				  ) {
					this._hideCartPopup(event);
				  }
				},

				_setActiveThumbnail: function(imageId) {
				  // If there is no element passed, find it by the current product image
				 //console.log(imageId);
				  if (typeof imageId === 'undefined') {
					imageId = $(
					  this.selectors.productImageWraps + ':not(.hide)',
					  this.$container
					).data('image-id');
					//console.log(imageId);
				  }

				  var $thumbnailWrappers = $(
					this.selectors.productThumbListItem + ':not(.slick-cloned)',
					this.$container
				  );

				  var $activeThumbnail = $thumbnailWrappers.find(
					this.selectors.productThumbImages +
					  "[data-thumbnail-id='" +
					  imageId +
					  "']"
				  );
				  $(this.selectors.productThumbImages)
					.removeClass(this.classes.activeClass)
					.removeAttr('aria-current');

				  $activeThumbnail.addClass(this.classes.activeClass);
				  $activeThumbnail.attr('aria-current', true);

				  if (!$thumbnailWrappers.hasClass('slick-slide')) {
					return;
				  }

				  var slideIndex = $activeThumbnail.parent().data('slick-index');

				  $(this.selectors.productThumbs).slick('slickGoTo', slideIndex, true);
				},
				//handle image switching just adds class hide to selected image and removes class hide from new image
				//then would need a custom function to handle the swipe to transition, or would actually have to have a slick slideshow in product liquid mjp
				_switchImage: function(imageId) {
				  var $newImage = $(
					this.selectors.productImageWraps + "[data-image-id='" + imageId + "']",
					this.$container
				  );
				  var $otherImages = $(
					this.selectors.productImageWraps +
					  ":not([data-image-id='" +
					  imageId +
					  "'])",
					this.$container
				  );

				  $newImage.removeClass(this.classes.hidden);
				  $otherImages.addClass(this.classes.hidden);
				  //handle update image index mjp
				  this.setActiveImageIndex();
				},

				_handleImageFocus: function(evt) {
				  if (evt.keyCode !== slate.utils.keyboardKeys.ENTER) return;

				  $(this.selectors.productFeaturedImage + ':visible').focus();
				},
				//handles slider for thumnails possible that slick only exist for the thumnail slider? would need a slick slider added? mjp
				_initThumbnailSlider: function() {
				  var options = {
					slidesToShow: 4,
					slidesToScroll: 3,
					infinite: false,
					prevArrow: '.thumbnails-slider__prev--' + this.settings.sectionId,
					nextArrow: '.thumbnails-slider__next--' + this.settings.sectionId,
					responsive: [
					  {
						breakpoint: 321,
						settings: {
						  slidesToShow: 3
						}
					  }
					]
				  };

				   $(this.selectors.productThumbs).not('.slick-initialized').slick(options);
				  // Accessibility concerns not yet fixed in Slick Slider
				  $(this.selectors.productThumbsWrapper, this.$container)
					.find('.slick-list')
					.removeAttr('aria-live');
				  $(this.selectors.productThumbsWrapper, this.$container)
					.find('.slick-disabled')
					.removeAttr('aria-disabled');

				  this.settings.sliderActive = true;
				},

				_destroyThumbnailSlider: function() {
				  $(this.selectors.productThumbs).slick('unslick');
				  this.settings.sliderActive = false;

				  // Accessibility concerns not yet fixed in Slick Slider
				  $(this.selectors.productThumbsWrapper, this.$container)
					.find('[tabindex="-1"]')
					.removeAttr('tabindex');
				},

				_updateAddToCart: function(evt) {
				  var variant = evt.variant;
					//console.log(this.$addToCart);
				  if (variant) {
					  $(this.selectors.productPrices)
					  .removeClass('visibility-hidden')
					  .attr('aria-hidden', 'true');
					  
					if (variant.available) {
						//CODE BY SANDEEP
						 $(this.selectors.addToCartmobile).prop('disabled', false);
						$(this.selectors.addToCartTextmobile).text(theme.strings.addToCart);
					 //END
					  this.$addToCart
						.removeAttr('aria-disabled')
						.attr('aria-label', theme.strings.addToCart);
					  $(this.selectors.addToCartText, this.$container).text(
						theme.strings.addToCart
					  );
					  this.$shopifyPaymentButton.show();
					} else {
						
						
					  // The variant doesn't exist, disable submit button and change the text.
					  // This may be an error or notice that a specific variant is not available.
					   $(this.selectors.addToCartmobile).prop('disabled', true);
					  $(this.selectors.addToCartTextmobile).text(theme.strings.soldOut);
					  
					  this.$addToCart
						.attr('aria-disabled', true)
						.attr('aria-label', theme.strings.soldOut);
					  $(this.selectors.addToCartText, this.$container).text(
						theme.strings.soldOut
					  );
					  this.$shopifyPaymentButton.hide();
					}
				  } else {
					  
						$(this.selectors.addToCartmobile).prop('disabled', true);
						$(this.selectors.addToCartTextmobile).text(theme.strings.unavailable);
						$(this.selectors.productPrices)
						.addClass('visibility-hidden')
						.attr('aria-hidden', 'false');
					 
					this.$addToCart
					  .attr('aria-disabled', true)
					  .attr('aria-label', theme.strings.unavailable);
						$(this.selectors.addToCartText, this.$container).text(
						  theme.strings.unavailable
						);
					   this.$shopifyPaymentButton.hide();
				  }
				},

				_updateAvailability: function(evt) {
				  // remove error message if one is showing
				  this._hideErrorMessage();

				  // update form submit
				  this._updateAddToCart(evt);
				  this._updatePrice(evt);
				},

				_updateImages: function(evt) {
				  var variant = evt.variant;
				  var imageId = variant.featured_image.id;

				  this._switchImage(imageId);
				  this._setActiveThumbnail(imageId);
				},

				_updatePrice: function(evt) {
				  var variant = evt.variant;

				  // Update the product price
				  $(this.selectors.originalPrice).html(
					theme.Currency.formatMoney(variant.price, theme.moneyFormat)
				  );

				  // Update and show the product's compare price if necessary
				  if (variant.compare_at_price > variant.price) {
					$(this.selectors.comparePrice)
					  .html(
						theme.Currency.formatMoney(
						  variant.compare_at_price,
						  theme.moneyFormat
						)
					  )
					  .removeClass('hide');

					$(this.selectors.originalPriceWrapper).addClass(
					  this.selectors.saleClasses
					);

					$(this.selectors.saleLabel).removeClass('hide');
				  } else {
					$(this.selectors.comparePrice).addClass('hide');
					$(this.selectors.saleLabel).addClass('hide');
					$(this.selectors.originalPriceWrapper).removeClass(
					  this.selectors.saleClasses
					);
				  }
				},

				_getBaseUnit: function(variant) {
				  return variant.unit_price_measurement.reference_value === 1
					? variant.unit_price_measurement.reference_unit
					: variant.unit_price_measurement.reference_value +
						variant.unit_price_measurement.reference_unit;
				},

				_updateSKU: function(evt) {
				  var variant = evt.variant;

				  // Update the sku
				  $(this.selectors.SKU).html(variant.sku);
				},

				onUnload: function() {
				  this.$container.off(this.settings.namespace);
				}
			  });

			  function _enableZoom(el) {
				var zoomUrl = $(el).data('zoom');
				$(el).zoom({
				  url: zoomUrl
				});
			  }

			  function _destroyZoom(el) {
				$(el).trigger('zoom.destroy');
			  }

			  return Product;
			})();
        } else {
			/* eslint-disable no-new */
			theme.Product = (function() {
			  function Product(container) {
				var $container = (this.$container = $(container));
				var sectionId = $container.attr('data-section-id');

				this.settings = {
				  // Breakpoints from src/stylesheets/global/variables.scss.liquid
				  mediaQueryMediumUp: 'screen and (min-width: 750px)',
				  mediaQuerySmall: 'screen and (max-width: 749px)',
				  bpSmall: false,
				  enableHistoryState: $container.data('enable-history-state') || false,
				  namespace: '.slideshow-' + sectionId,
				  sectionId: sectionId,
				  sliderActive: false,
				  zoomEnabled: false
				};

				this.selectors = {
				  addToCart: '#AddToCart-' + sectionId,
				  addToCartText: '#AddToCartText-' + sectionId,
				  comparePrice: '#ComparePrice-' + sectionId,
				  originalPrice: '#ProductPrice-' + sectionId,
				  SKU: '.variant-sku',
				  originalPriceWrapper: '.product-price__price-' + sectionId,
				  originalSelectorId: '#ProductSelect-' + sectionId,
				  productImageWraps: '.product-single__photo',
				  productPrices: '.product-single__price-' + sectionId,
				  productThumbImages: '.product-single__thumbnail--' + sectionId,
				  productThumbs: '.product-single__thumbnails-' + sectionId,
				  saleClasses: 'product-price__sale product-price__sale--single',
				  saleLabel: '.product-price__sale-label-' + sectionId,
				  singleOptionSelector: '.single-option-selector-' + sectionId
				};

				// Stop parsing if we don't have the product json script tag when loading
				// section in the Theme Editor
				if (!$('#ProductJson-' + sectionId).html()) {
				  return;
				}

				this.productSingleObject = JSON.parse(
				  document.getElementById('ProductJson-' + sectionId).innerHTML
				);

				this.settings.zoomEnabled = $(this.selectors.productImageWraps).hasClass(
				  'js-zoom-enabled'
				);

				this._initBreakpoints();
				this._stringOverrides();
				this._initVariants();
				this._initImageSwitch();
				this._setActiveThumbnail();
			  }

			  Product.prototype = _.assignIn({}, Product.prototype, {
				_stringOverrides: function() {
				  theme.productStrings = theme.productStrings || {};
				  $.extend(theme.strings, theme.productStrings);
				},

				_initBreakpoints: function() {
				  var self = this;

				  enquire.register(this.settings.mediaQuerySmall, {
					match: function() {
					  // initialize thumbnail slider on mobile if more than three thumbnails
					  if ($(self.selectors.productThumbImages).length > 3) {
						self._initThumbnailSlider();
					  }

					  // destroy image zooming if enabled
					  if (self.settings.zoomEnabled) {
						$(self.selectors.productImageWraps).each(function() {
						  _destroyZoom(this);
						});
					  }

					  self.settings.bpSmall = true;
					},
					unmatch: function() {
					  if (self.settings.sliderActive) {
						self._destroyThumbnailSlider();
					  }

					  self.settings.bpSmall = false;
					}
				  });

				  enquire.register(this.settings.mediaQueryMediumUp, {
					match: function() {
					  if ($(self.selectors.productThumbImages).length > 3) {
						self._initThumbnailSlider();
					  }
					  if (self.settings.zoomEnabled) {
						$(self.selectors.productImageWraps).each(function() {
						  _enableZoom(this);
						});
					  }
					}
				  });
				},

				_initVariants: function() {
				  var options = {
					$container: this.$container,
					enableHistoryState:
					  this.$container.data('enable-history-state') || false,
					singleOptionSelector: this.selectors.singleOptionSelector,
					originalSelectorId: this.selectors.originalSelectorId,
					product: this.productSingleObject
				  };

				  this.variants = new slate.Variants(options);

				  this.$container.on(
					'variantChange' + this.settings.namespace,
					this._updateAddToCart.bind(this)
				  );
				  this.$container.on(
					'variantImageChange' + this.settings.namespace,
					this._updateImages.bind(this)
				  );
				  this.$container.on(
					'variantPriceChange' + this.settings.namespace,
					this._updatePrice.bind(this)
				  );
				  this.$container.on(
					'variantSKUChange' + this.settings.namespace,
					this._updateSKU.bind(this)
				  );
				},

				_initImageSwitch: function() {
				  if (!$(this.selectors.productThumbImages).length) {
					return;
				  }

				  var self = this;

				  $(this.selectors.productThumbImages).on('click', function(evt) {
					evt.preventDefault();
					var $el = $(this);

					var imageId = $el.data('thumbnail-id');
					//console.log(imageId);
					self._switchImage(imageId);
					self._setActiveThumbnail(imageId);
				  });
				},

				_setActiveThumbnail: function(imageId) {
					
				  var activeClass = 'active-thumb';

				  // If there is no element passed, find it by the current product image
				  if (typeof imageId === 'undefined') {
					imageId = $(this.selectors.productImageWraps + ":not('.hide')").data(
					  'image-id'
					);
				  }

				  var $thumbnail = $(
					this.selectors.productThumbImages +
					  "[data-thumbnail-id='" +
					  imageId +
					  "']"
				  );
				  $(this.selectors.productThumbImages).removeClass(activeClass);
				  $thumbnail.addClass(activeClass);
				},

				_switchImage: function(imageId) {
				  var $newImage = $(
					this.selectors.productImageWraps + "[data-image-id='" + imageId + "']",
					this.$container
				  );
				  var $otherImages = $(
					this.selectors.productImageWraps +
					  ":not([data-image-id='" +
					  imageId +
					  "'])",
					this.$container
				  );
				  $newImage.removeClass('hide');
				  $otherImages.addClass('hide');
				},

				_initThumbnailSlider: function() {
				  var options = {
					slidesToShow: 4,
					slidesToScroll: 1,
					infinite: false,
					prevArrow: '.thumbnails-slider__prev--' + this.settings.sectionId,
					nextArrow: '.thumbnails-slider__next--' + this.settings.sectionId,
					responsive: [
					  {
						breakpoint: 321,
						settings: {
						  slidesToShow: 3
						}
					  }
					]
				  };

				  $(this.selectors.productThumbs).not('.slick-initialized').slick(options);
				  this.settings.sliderActive = true;
				},

				_destroyThumbnailSlider: function() {
				  $(this.selectors.productThumbs).slick('unslick');
				  this.settings.sliderActive = false;
				},

				_updateAddToCart: function(evt) {
				  var variant = evt.variant;

				  if (variant) {
					$(this.selectors.productPrices)
					  .removeClass('visibility-hidden')
					  .attr('aria-hidden', 'true');

					if (variant.available) {
					  $(this.selectors.addToCart).prop('disabled', false);
					  $(this.selectors.addToCartText).text(theme.strings.addToCart);
					} else {
					  // The variant doesn't exist, disable submit button and change the text.
					  // This may be an error or notice that a specific variant is not available.
					  $(this.selectors.addToCart).prop('disabled', true);
					  $(this.selectors.addToCartText).text(theme.strings.soldOut);
					}


					$('.js-inputships').removeAttr("name", "properties[Estimated shipping date]");
					$('.js-inputships[data-variant-days="' + variant.id + '"]').attr("name", "properties[Estimated shipping date]");

				  } else {
					$(this.selectors.addToCart).prop('disabled', true);
					$(this.selectors.addToCartText).text(theme.strings.unavailable);
					$(this.selectors.productPrices)
					  .addClass('visibility-hidden')
					  .attr('aria-hidden', 'false');
				  }
				},

				_updateImages: function(evt) {
				  var variant = evt.variant;
				  var imageId = variant.featured_image.id;

				  this._switchImage(imageId);
				  this._setActiveThumbnail(imageId);
				},

				_updatePrice: function(evt) {
				  var variant = evt.variant;

				  // Update the product price
				  $(this.selectors.originalPrice).html(
					theme.Currency.formatMoney(variant.price, theme.moneyFormat)
				  );

				  // Update and show the product's compare price if necessary
				  if (variant.compare_at_price > variant.price) {
					$(this.selectors.comparePrice)
					  .html(
						theme.Currency.formatMoney(
						  variant.compare_at_price,
						  theme.moneyFormat
						)
					  )
					  .removeClass('hide');

					$(this.selectors.originalPriceWrapper).addClass(
					  this.selectors.saleClasses
					);

					$(this.selectors.saleLabel).removeClass('hide');
				  } else {
					$(this.selectors.comparePrice).addClass('hide');
					$(this.selectors.saleLabel).addClass('hide');
					$(this.selectors.originalPriceWrapper).removeClass(
					  this.selectors.saleClasses
					);
				  }
				},

				_updateSKU: function(evt) {
				  var variant = evt.variant;

				  // Update the sku
				  $(this.selectors.SKU).html(variant.sku);
				},

				onUnload: function() {
				  this.$container.off(this.settings.namespace);
				}
			  });

			  function _enableZoom(el) {
				var zoomUrl = $(el).data('zoom');
				$(el).zoom({
				  url: zoomUrl
				});
			  }

			  function _destroyZoom(el) {
				$(el).trigger('zoom.destroy');
			  }

			  return Product;
			})();
        }
    
/* 	$(document).on('click','.js-mobile-nav-toggle',function(){	
		$('body').addClass('layOver');
		$('nav').addClass('js-menu--is-open');
		$('nav').css("transform","translateX(0px)").css("-ms-transform","translateX(0px)").css("-webkit-transform","translateX(0px)").css("transition", "all 0.45s cubic-bezier(0.29, 0.63, 0.44, 1");
		
	}); */
	/* $(document).on("click", function() {	
		$('body').removeClass('layOver');
		$('nav').removeClass('js-menu--is-open');
		$('nav').css("transform","translateX(-100px)").css("-ms-transform","translateX(-100px)").css("-webkit-transform","translateX(-100px)").css("transition", "all 0.45s cubic-bezier(0.29, 0.63, 0.44, 1");
	}); */
	
	
})();

// end document ready function
