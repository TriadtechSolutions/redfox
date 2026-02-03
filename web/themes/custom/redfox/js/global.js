/**
 * @file
 * Global utilities.
 *
 */
(function (Drupal,once) {

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

})(Drupal,once);
