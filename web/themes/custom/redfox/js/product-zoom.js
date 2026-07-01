/**
 * @file
 * Product image zoom: desktop magnifier lens.
 */
(function (Drupal, once) {
    'use strict';

    /* =========================================================
       DESKTOP — Magnifier Lens
       ========================================================= */
    Drupal.behaviors.redfoxProductZoomDesktop = {
        attach: function (context) {
            if (window.matchMedia('(pointer: coarse)').matches) return;

            once('product-zoom-desktop', '.main-image-container', context).forEach(function (container) {
                var ZOOM = 2.5;
                var LENS_SIZE = 120; // px diameter
                var RESULT_SIZE = 360; // px side

                /* --- Create lens element --- */
                var lens = document.createElement('div');
                lens.className = 'zoom-lens';
                container.appendChild(lens);

                /* --- Create result box --- */
                var result = document.createElement('div');
                result.className = 'zoom-result';
                // Insert result after the images-wrapper (or after container)
                var wrapper = container.closest('.product-images-wrapper') || container.parentElement;
                wrapper.parentElement.insertBefore(result, wrapper.nextSibling);

                /* --- State --- */
                var active = false;

                function getImg() {
                    return container.querySelector('img');
                }

                function showZoom() {
                    var img = getImg();
                    if (!img) return;
                    if (!container.contains(lens)) {
                        container.appendChild(lens);
                    }
                    lens.style.display = 'block';
                    result.style.display = 'block';
                    result.style.backgroundImage = 'url("' + (img.currentSrc || img.src) + '")';
                    active = true;
                }

                function hideZoom() {
                    lens.style.display = 'none';
                    result.style.display = 'none';
                    active = false;
                }

                function moveLens(e) {
                    var img = getImg();
                    if (!img) return;

                    var rect = container.getBoundingClientRect();
                    var containerW = rect.width;
                    var containerH = rect.height;

                    // Cursor position relative to container
                    var cx = e.clientX - rect.left;
                    var cy = e.clientY - rect.top;

                    // Clamp lens so it stays inside the container
                    var lx = Math.max(LENS_SIZE / 2, Math.min(cx, containerW - LENS_SIZE / 2));
                    var ly = Math.max(LENS_SIZE / 2, Math.min(cy, containerH - LENS_SIZE / 2));

                    lens.style.left = (lx - LENS_SIZE / 2) + 'px';
                    lens.style.top = (ly - LENS_SIZE / 2) + 'px';

                    // Background-size = image natural ratio scaled so it covers the result box at ZOOM level
                    var imgNW = img.naturalWidth || img.offsetWidth;
                    var imgNH = img.naturalHeight || img.offsetHeight;
                    var scaleX = containerW / imgNW;
                    var scaleY = containerH / imgNH;
                    var scale = Math.min(scaleX, scaleY); // object-fit: contain equivalent

                    var displayedW = imgNW * scale;
                    var displayedH = imgNH * scale;
                    var imgOffsetX = (containerW - displayedW) / 2;
                    var imgOffsetY = (containerH - displayedH) / 2;

                    // Image position under lens (relative to image, not container)
                    var imgRelX = cx - imgOffsetX;
                    var imgRelY = cy - imgOffsetY;

                    // Fraction within the image
                    var fracX = Math.max(0, Math.min(1, imgRelX / displayedW));
                    var fracY = Math.max(0, Math.min(1, imgRelY / displayedH));

                    // Background size in result box at zoom level
                    var bgW = RESULT_SIZE * ZOOM;
                    var bgH = (imgNH / imgNW) * bgW;

                    // Background position so the cursor point is centred in result
                    var bgX = -(fracX * bgW - RESULT_SIZE / 2);
                    var bgY = -(fracY * bgH - RESULT_SIZE / 2);

                    result.style.backgroundSize = bgW + 'px ' + bgH + 'px';
                    result.style.backgroundPosition = bgX + 'px ' + bgY + 'px';
                }

                container.addEventListener('mouseenter', showZoom);
                container.addEventListener('mousemove', moveLens);
                container.addEventListener('mouseleave', hideZoom);

                // When thumbnail click changes the main image, update the result src
                var thumbGallery = document.querySelector('.thumbnail-gallery');
                if (thumbGallery) {
                    thumbGallery.addEventListener('click', function () {
                        // After DOM updates (~1 frame), update bg image
                        requestAnimationFrame(function () {
                            if (active) {
                                var img = getImg();
                                if (img) {
                                    result.style.backgroundImage = 'url("' + (img.currentSrc || img.src) + '")';
                                }
                            }
                        });
                    });
                }
            });
        }
    };
})(Drupal, once);
