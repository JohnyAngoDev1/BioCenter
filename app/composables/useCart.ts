import { useState, computed, onMounted, watch } from '#imports'
import type { Service } from '~/interfaces/service.interface'

export interface CartItem extends Service {
  quantity: number
}

export const useCart = () => {
  const cart = useState<CartItem[]>('cart', () => [])

  // Persistencia
  onMounted(() => {
    const savedCart = localStorage.getItem('biocenter_cart')
    if (savedCart) {
      try {
        cart.value = JSON.parse(savedCart)
      } catch (e) {
        console.error('Error loading cart from localStorage', e)
      }
    }
  })

  watch(cart, (newCart) => {
    localStorage.setItem('biocenter_cart', JSON.stringify(newCart))
  }, { deep: true })

  const addToCart = (product: Service) => {
    const existing = cart.value.find(item => item.id === product.id)
    if (existing) {
      existing.quantity++
    } else {
      cart.value.push({ ...product, quantity: 1 })
    }
  }

  const removeFromCart = (id: number) => {
    const index = cart.value.findIndex(item => item.id === id)
    if (index > -1) {
      cart.value.splice(index, 1)
    }
  }

  const updateQuantity = (id: number, delta: number) => {
    const item = cart.value.find(i => i.id === id)
    if (item) {
      const newQty = item.quantity + delta
      if (newQty > 0) {
        item.quantity = newQty
      } else {
        removeFromCart(id)
      }
    }
  }

  const clearCart = () => {
    cart.value = []
  }

  const cartCount = computed(() => {
    return cart.value.reduce((total, item) => total + item.quantity, 0)
  })

  const cartTotal = computed(() => {
    return cart.value.reduce((total, item) => total + (item.price * item.quantity), 0)
  })

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    cartTotal
  }
}
