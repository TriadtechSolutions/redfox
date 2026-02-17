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

})(Drupal, once);
