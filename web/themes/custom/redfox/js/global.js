/**
 * @file
 * Global utilities.
 *
 */
(function (Drupal, once) {

  'use strict';

  Drupal.behaviors.redfox = {
    attach: function (context, settings) {

      const galleries = once(
        'image-gallery',
        '.main-image-container',
        context
      );

      galleries.forEach((mainContainer) => {

        const thumbnailContainer = context.querySelector('.thumbnail-gallery');
        if (!thumbnailContainer) {
          return;
        }

        const allImages = thumbnailContainer.querySelectorAll('.field__item');
        if (!allImages.length) {
          return;
        }

        // Show first image in main container
        mainContainer.innerHTML = '';
        const firstImageClone = allImages[0].cloneNode(true);
        mainContainer.appendChild(firstImageClone);

        // Setup thumbnails
        allImages.forEach((thumbnail, index) => {
          thumbnail.classList.add('thumbnail-item');

          if (index === 0) {
            thumbnail.classList.add('active');
          }

          thumbnail.addEventListener('click', (e) => {
            e.preventDefault();

            allImages.forEach(t => t.classList.remove('active'));
            thumbnail.classList.add('active');

            mainContainer.innerHTML = '';
            const imageClone = thumbnail.cloneNode(true);
            imageClone.classList.remove('thumbnail-item', 'active');
            mainContainer.appendChild(imageClone);
          });
        });

      });

    }
  };

  Drupal.behaviors.redfoxHeader = {
    attach: function (context, settings) {

      // Tablet/Mobile Menu Toggle
      const menuToggles = once('redfox-menu-toggle', '.tablet-menu-toggle', context);
      menuToggles.forEach((menuToggle) => {
        const navBlock = document.getElementById('block-redfox-mainnavigation');
        if (navBlock) {
          menuToggle.addEventListener('click', function (e) {
            e.preventDefault();
            navBlock.classList.toggle('d-none');
            navBlock.classList.toggle('show-tablet-menu');
          });
        }
      });

      // Tablet/Mobile Search Toggle
      const searchToggles = once('redfox-search-toggle', '.tablet-search-toggle', context);
      searchToggles.forEach((searchToggle) => {
        searchToggle.addEventListener('click', function (e) {
          e.preventDefault();

          // Move selection inside the click handler to ensure we get the live element
          const searchBlock = document.getElementById('block-redfox-views-block-product-search-block-1') ||
            document.querySelector('[id*="product-search-block"]') ||
            document.querySelector('.block-views-blockproduct-search-block-1');

          if (!searchBlock) {
            console.error('Search block not found. IDs searched: block-redfox-views-block-product-search-block-1, [id*="product-search-block"]');
            return;
          }

          // Toggle class
          searchBlock.classList.toggle('search-overlay-visible');
          const isVisible = searchBlock.classList.contains('search-overlay-visible');

          // Toggle Aria
          searchToggle.setAttribute('aria-expanded', isVisible);

          // Explicitly toggle display style
          if (isVisible) {
            searchBlock.style.display = 'block';
            // Focus input
            setTimeout(() => {
              const input = searchBlock.querySelector('input[type="text"], input[type="search"]');
              if (input) input.focus();
            }, 50);
          } else {
            searchBlock.style.display = 'none';
          }
        });
      });

    }
  };

  Drupal.behaviors.quantitySelector = {
    attach: function (context) {
      once('quantity-selector', '#edit-quantity-wrapper .js-form-item', context).forEach(function (quantityWrapper) {
        const input = quantityWrapper.querySelector('input[type="number"]');
        if (input) {
          // Create selector container
          const selector = document.createElement('div');
          selector.className = 'quantity-selector';

          // Minus button
          const minusBtn = document.createElement('button');
          minusBtn.type = 'button';
          minusBtn.className = 'quantity-btn minus';
          minusBtn.innerHTML = '&minus;';
          minusBtn.onclick = (e) => {
            e.preventDefault();
            const val = parseInt(input.value) || 1;
            if (val > 1) {
              input.value = val - 1;
              input.dispatchEvent(new Event('change', { bubbles: true }));
            }
          };

          // Plus button
          const plusBtn = document.createElement('button');
          plusBtn.type = 'button';
          plusBtn.className = 'quantity-btn plus';
          plusBtn.innerHTML = '&plus;';
          plusBtn.onclick = (e) => {
            e.preventDefault();
            const val = parseInt(input.value) || 1;
            input.value = val + 1;
            input.dispatchEvent(new Event('change', { bubbles: true }));
          };

          // Wrap input
          input.parentNode.insertBefore(selector, input);
          selector.appendChild(minusBtn);
          selector.appendChild(input);
          selector.appendChild(plusBtn);

          // Add stock message
          const stockMsg = document.createElement('div');
          stockMsg.className = 'stock-message';
          stockMsg.innerText = 'Only 5 units left at this price';
          quantityWrapper.parentNode.appendChild(stockMsg);
        }
      });
    }
  };
  Drupal.behaviors.dynamicStrikePrice = {
    attach: function (context) {
      once('dynamic-strike-price', '.product-price', context).forEach(function (priceEl) {
        // Find the actual price text value
        const priceValNode = priceEl.querySelector('.field__item') || priceEl;
        let priceText = priceValNode.textContent.trim();

        const match = priceText.match(/[\d,.]+/);
        if (match) {
          const numericPart = match[0].replace(/,/g, '');
          const value = parseFloat(numericPart);
          const strikeValue = value + 50;

          // Extract currency symbol (handling both prefix and suffix)
          const symbol = priceText.replace(match[0], '').trim();
          const isPrefix = priceText.startsWith(symbol);

          let strikeEl = priceEl.querySelector('.product-list-price');
          if (!strikeEl) {
            strikeEl = document.createElement('span');
            strikeEl.className = 'product-list-price';
            priceEl.appendChild(strikeEl);
          }

          const formattedStrike = strikeValue.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          });

          strikeEl.innerText = isPrefix ? symbol + formattedStrike : formattedStrike + ' ' + symbol;
        }
      });
    }
  };
  Drupal.behaviors.cartBadgeFix = {
    attach: function (context) {
      once('cart-badge-fix', '.cart-block--summary__count', context).forEach(function (countEl) {
        const text = countEl.textContent.trim();
        const match = text.match(/\d+/);
        if (match) {
          countEl.textContent = match[0];
          countEl.style.fontSize = '11px';
        }
      });
    }
  };
  Drupal.behaviors.hotDealsLoadMore = {
    attach: function (context) {
      once('hot-deals-load-more', '.js-load-more-hot-deals', context).forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          const grid = document.querySelector('.js-hot-deals-grid');
          if (grid) {
            grid.classList.add('show-all');
            const wrapper = btn.closest('.load-more-wrapper');
            if (wrapper) {
              wrapper.style.display = 'none';
            }
          }
        });
      });
    }
  };

  Drupal.behaviors.mobileFilterSidebar = {
    attach: function (context, settings) {
      once('redfox-sidebar-filter', '#sidebar_first', context).forEach(function (sidebar) {
        const mainContent = document.querySelector('.main-content');
        if (!mainContent) return;

        const hasFilters = sidebar.querySelector('.views-exposed-form');
        if (!hasFilters) return;

        // 1. Create mobile "Filter Products" bar above the product grid
        const filterBtnWrapper = document.createElement('div');
        filterBtnWrapper.className = 'mobile-filter-bar d-lg-none';

        const filterBtn = document.createElement('button');
        filterBtn.className = 'mobile-filter-toggle';
        filterBtn.type = 'button';
        filterBtn.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" style="margin-right:6px;">' +
          '<path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.124.325L9 8.303V11.5a.5.5 0 0 1-.25.433l-2.8 1.6a.5.5 0 0 1-.75-.433V8.303L.624 3.825A.5.5 0 0 1 .5 3.5v-2z"/>' +
          '</svg>Filter Products';

        filterBtnWrapper.appendChild(filterBtn);

        const mainSection = mainContent.querySelector('.section') || mainContent;
        if (!mainSection.querySelector('.mobile-filter-bar')) {
          mainSection.insertBefore(filterBtnWrapper, mainSection.firstChild);
        }

        filterBtn.addEventListener('click', function (e) {
          e.preventDefault();
          document.body.classList.add('filters-open');
        });

        // 2. Add close button inside the sidebar drawer
        if (!sidebar.querySelector('.sidebar-close-btn')) {
          const closeBtn = document.createElement('button');
          closeBtn.type = 'button';
          closeBtn.className = 'sidebar-close-btn d-lg-none';
          closeBtn.innerHTML = '&times;';
          closeBtn.setAttribute('aria-label', 'Close filters');
          sidebar.insertBefore(closeBtn, sidebar.firstChild);

          closeBtn.addEventListener('click', function (e) {
            e.preventDefault();
            document.body.classList.remove('filters-open');
          });
        }

        // 3. Dimming overlay behind the open drawer
        let overlay = document.querySelector('.sidebar-filter-overlay');
        if (!overlay) {
          overlay = document.createElement('div');
          overlay.className = 'sidebar-filter-overlay';
          document.body.appendChild(overlay);

          overlay.addEventListener('click', function () {
            document.body.classList.remove('filters-open');
          });
        }
      });

      // Close on resize back to desktop
      window.addEventListener('resize', function () {
        if (window.innerWidth >= 992) {
          document.body.classList.remove('filters-open');
        }
      });
    }
  };

})(Drupal, once);

Drupal.behaviors.homeBannerSwiper = {
  attach: function (context) {
    once('home-banner-swiper', '.home-banner-swiper', context).forEach(function (swiperEl) {
      new Swiper(swiperEl, {
        loop: true,
        autoplay: {
          delay: 1500000,
          disableOnInteraction: false,
        },
        pagination: {
          el: swiperEl.querySelector('.swiper-pagination'),
          clickable: true,
        },
        navigation: {
          nextEl: swiperEl.querySelector('.swiper-button-next'),
          prevEl: swiperEl.querySelector('.swiper-button-prev'),
        },
        speed: 1500,
        grabCursor: true,
      });
    });
  }
};
