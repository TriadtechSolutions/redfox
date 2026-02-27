<?php

namespace Drupal\redfox_commerce;

use Drupal\commerce_cart\CartManagerInterface;
use Drupal\commerce_order\Entity\OrderInterface;
use Drupal\commerce_order\Entity\OrderItemInterface;
use Drupal\commerce\PurchasableEntityInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Symfony\Component\HttpFoundation\RequestStack;

class RedfoxCartManager implements CartManagerInterface {

  public function __construct(
    protected CartManagerInterface $inner,
    protected EntityTypeManagerInterface $entityTypeManager,
    protected RequestStack $requestStack,
  ) {}

  /**
   * {@inheritdoc}
   */
  public function addEntity(OrderInterface $cart, PurchasableEntityInterface $entity, $quantity = '1', $combine = TRUE, $save_cart = TRUE) {
    return $this->inner->addEntity($cart, $entity, $quantity, $combine, $save_cart);
  }

  /**
   * {@inheritdoc}
   */
  public function createOrderItem(PurchasableEntityInterface $entity, $quantity = '1') {
    return $this->inner->createOrderItem($entity, $quantity);
  }

  /**
   * {@inheritdoc}
   *
   * Intercept here to fix the purchased_entity to the correct variation
   * BEFORE Commerce's combine/duplicate check runs.
   */
  public function addOrderItem(OrderInterface $cart, OrderItemInterface $order_item, $combine = TRUE, $save_cart = TRUE) {
    $session = $this->requestStack->getCurrentRequest()->getSession();
    $variation_id = $session->get('redfox_variation_id');

    if ($variation_id) {
      $variation = $this->entityTypeManager
        ->getStorage('commerce_product_variation')
        ->load($variation_id);

      if ($variation) {
        $current = $order_item->getPurchasedEntity();
        if ($current && $current->getProductId() == $variation->getProductId()) {
          $order_item->set('purchased_entity', $variation);
          $order_item->set('unit_price', $variation->getPrice());
        }
      }

      $session->remove('redfox_variation_id');
    }

    return $this->inner->addOrderItem($cart, $order_item, $combine, $save_cart);
  }

  /**
   * {@inheritdoc}
   */
  public function updateOrderItem(OrderInterface $cart, OrderItemInterface $order_item, $save_cart = TRUE) {
    return $this->inner->updateOrderItem($cart, $order_item, $save_cart);
  }

  /**
   * {@inheritdoc}
   */
  public function removeOrderItem(OrderInterface $cart, OrderItemInterface $order_item, $save_cart = TRUE) {
    return $this->inner->removeOrderItem($cart, $order_item, $save_cart);
  }

  /**
   * {@inheritdoc}
   */
  public function emptyCart(OrderInterface $cart, $save_cart = TRUE) {
    return $this->inner->emptyCart($cart, $save_cart);
  }

}