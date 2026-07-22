import { Routes, Route } from 'react-router-dom'
import { PublicLayout } from '@/layouts/PublicLayout'
import { CustomerLayout } from '@/layouts/CustomerLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import { GuestRoute } from './GuestRoute'
import { CustomerRoute } from './CustomerRoute'
import { AdminRoute } from './AdminRoute'

import { HomePage } from '@/pages/public/HomePage'
import { ProductsPage } from '@/pages/public/ProductsPage'
import { ProductsCloudPage } from '@/pages/public/ProductsCloudPage'
import { ProductsKasperskyPage } from '@/pages/public/ProductsKasperskyPage'
import { ProductsEsimPage } from '@/pages/public/ProductsEsimPage'
import { ProductDetailPage } from '@/pages/public/ProductDetailPage'
import { PricingPage } from '@/pages/public/PricingPage'
import { SolutionsPage } from '@/pages/public/SolutionsPage'
import { AboutPage } from '@/pages/public/AboutPage'
import { ContactPage } from '@/pages/public/ContactPage'
import { SupportPage } from '@/pages/public/SupportPage'
import { SupportDetailPage } from '@/pages/public/SupportDetailPage'
import { EsimDevicesPage } from '@/pages/public/EsimDevicesPage'
import { TermsPage } from '@/pages/public/TermsPage'
import { PrivacyPage } from '@/pages/public/PrivacyPage'
import { NotFoundPage } from '@/pages/public/NotFoundPage'
import { CartPage } from '@/pages/public/CartPage'
import { CheckoutPage } from '@/pages/public/CheckoutPage'
import { CheckoutSuccessPage } from '@/pages/public/CheckoutSuccessPage'
import { PaymentPage } from '@/pages/public/PaymentPage'

import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage'

import { DashboardPage } from '@/pages/customer/DashboardPage'
import { OrdersPage } from '@/pages/customer/OrdersPage'
import { OrderDetailPage } from '@/pages/customer/OrderDetailPage'
import { ServicesPage } from '@/pages/customer/ServicesPage'
import { ServiceDetailPage } from '@/pages/customer/ServiceDetailPage'
import { TicketsPage } from '@/pages/customer/TicketsPage'
import { TicketNewPage } from '@/pages/customer/TicketNewPage'
import { ProfilePage } from '@/pages/customer/ProfilePage'
import { SecurityPage } from '@/pages/customer/SecurityPage'

import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { AdminProductsPage } from '@/pages/admin/AdminProductsPage'
import { AdminProductFormPage } from '@/pages/admin/AdminProductFormPage'
import { AdminOrdersPage } from '@/pages/admin/AdminOrdersPage'
import { AdminOrderDetailPage } from '@/pages/admin/AdminOrderDetailPage'
import { AdminCustomersPage } from '@/pages/admin/AdminCustomersPage'
import { AdminCustomerDetailPage } from '@/pages/admin/AdminCustomerDetailPage'
import { AdminServicesPage } from '@/pages/admin/AdminServicesPage'
import { AdminLicensesPage } from '@/pages/admin/AdminLicensesPage'
import { AdminEsimsPage } from '@/pages/admin/AdminEsimsPage'
import { AdminTicketsPage } from '@/pages/admin/AdminTicketsPage'
import { AdminContentPage } from '@/pages/admin/AdminContentPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/cloud" element={<ProductsCloudPage />} />
        <Route path="/products/kaspersky" element={<ProductsKasperskyPage />} />
        <Route path="/products/esim" element={<ProductsEsimPage />} />
        <Route path="/products/:slug" element={<ProductDetailPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/solutions" element={<SolutionsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/support/:slug" element={<SupportDetailPage />} />
        <Route path="/esim-compatible-devices" element={<EsimDevicesPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/checkout/success/:orderCode" element={<CheckoutSuccessPage />} />
        <Route path="/checkout/payment/:orderId" element={<PaymentPage />} />

        <Route element={<GuestRoute />}>
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Login/Register use their own full-bleed AuthLayout — no site Header/Footer. */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<CustomerRoute />}>
        <Route element={<CustomerLayout />}>
          <Route path="/account" element={<DashboardPage />} />
          <Route path="/account/orders" element={<OrdersPage />} />
          <Route path="/account/orders/:orderId" element={<OrderDetailPage />} />
          <Route path="/account/services" element={<ServicesPage />} />
          <Route path="/account/services/:serviceId" element={<ServiceDetailPage />} />
          <Route path="/account/tickets" element={<TicketsPage />} />
          <Route path="/account/tickets/new" element={<TicketNewPage />} />
          <Route path="/account/profile" element={<ProfilePage />} />
          <Route path="/account/security" element={<SecurityPage />} />
        </Route>
      </Route>

      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/products" element={<AdminProductsPage />} />
          <Route path="/admin/products/new" element={<AdminProductFormPage />} />
          <Route path="/admin/products/:id/edit" element={<AdminProductFormPage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/orders/:orderId" element={<AdminOrderDetailPage />} />
          <Route path="/admin/customers" element={<AdminCustomersPage />} />
          <Route path="/admin/customers/:customerId" element={<AdminCustomerDetailPage />} />
          <Route path="/admin/services" element={<AdminServicesPage />} />
          <Route path="/admin/licenses" element={<AdminLicensesPage />} />
          <Route path="/admin/esims" element={<AdminEsimsPage />} />
          <Route path="/admin/tickets" element={<AdminTicketsPage />} />
          <Route path="/admin/content" element={<AdminContentPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
