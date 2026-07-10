export interface EsimDevice {
  id: string
  brand: string
  model: string
  supported: boolean
}

export const mockEsimDevices: EsimDevice[] = [
  { id: 'dev-01', brand: 'Apple', model: 'iPhone 15 / 15 Pro / 15 Pro Max', supported: true },
  { id: 'dev-02', brand: 'Apple', model: 'iPhone 14 / 14 Pro / 14 Pro Max', supported: true },
  { id: 'dev-03', brand: 'Apple', model: 'iPhone 13 / 13 Pro / 13 Pro Max', supported: true },
  { id: 'dev-04', brand: 'Apple', model: 'iPhone SE (2020 trở lên)', supported: true },
  { id: 'dev-05', brand: 'Apple', model: 'iPhone XS / XS Max / XR', supported: true },
  { id: 'dev-06', brand: 'Apple', model: 'iPhone X trở về trước', supported: false },
  { id: 'dev-07', brand: 'Samsung', model: 'Galaxy S24 / S23 / S22', supported: true },
  { id: 'dev-08', brand: 'Samsung', model: 'Galaxy Z Fold5 / Flip5', supported: true },
  { id: 'dev-09', brand: 'Samsung', model: 'Galaxy Note 20', supported: true },
  { id: 'dev-10', brand: 'Samsung', model: 'Galaxy A-series (đa số)', supported: false },
  { id: 'dev-11', brand: 'Google', model: 'Pixel 8 / 8 Pro', supported: true },
  { id: 'dev-12', brand: 'Google', model: 'Pixel 7 / 7 Pro', supported: true },
  { id: 'dev-13', brand: 'Google', model: 'Pixel 6 / 6 Pro', supported: true },
  { id: 'dev-14', brand: 'Google', model: 'Pixel 4a', supported: false },
  { id: 'dev-15', brand: 'Huawei', model: 'P40 Pro', supported: true },
  { id: 'dev-16', brand: 'Huawei', model: 'Mate 40 Pro', supported: true },
  { id: 'dev-17', brand: 'Huawei', model: 'Nova series', supported: false },
  { id: 'dev-18', brand: 'Oppo', model: 'Find X5 Pro', supported: true },
  { id: 'dev-19', brand: 'Oppo', model: 'Find N2 Flip', supported: true },
  { id: 'dev-20', brand: 'Oppo', model: 'A-series (đa số)', supported: false },
]
