import ProductDetailClient from './ProductDetailClient'

export default function ProductDetailPage({ params }) {
  const { id } = params  // ناخد الـ id من الرابط
  return <ProductDetailClient productId={id} />
}
