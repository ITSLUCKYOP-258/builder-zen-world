import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  query,
  orderBy 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

export interface Product {
  id?: string;
  name: string;
  price: number;
  description: string;
  category: string;
  sizes: string[];
  colors: { name: string; value: string }[];
  images: string[];
  features: string[];
  rating?: number;
  reviews?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const PRODUCTS_COLLECTION = 'products';

// Get all products
export async function getProducts(): Promise<Product[]> {
  try {
    console.log('Fetching products from Firebase...');
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const q = query(productsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const firebaseProducts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];

    console.log('Firebase products found:', firebaseProducts.length);

    // Also sync with localStorage for reliability
    if (firebaseProducts.length > 0) {
      localStorage.setItem('s2-wear-products', JSON.stringify(firebaseProducts));
      return firebaseProducts;
    }

    // If no Firebase products, check localStorage
    const localProducts = getLocalProducts();
    console.log('Local products found:', localProducts.length);
    return localProducts;
  } catch (error) {
    console.error('Error getting products from Firebase, using localStorage fallback:', error);
    return getLocalProducts();
  }
}

// Helper function to get local products
function getLocalProducts(): Product[] {
  const localProducts = localStorage.getItem('s2-wear-products');
  if (localProducts) {
    try {
      return JSON.parse(localProducts);
    } catch {
      console.warn('Invalid localStorage data, returning empty array');
      return [];
    }
  }

  // Return sample products if nothing exists
  const sampleProducts: Product[] = [
    {
      id: 'sample-1',
      name: "Premium Cotton T-Shirt",
      price: 29.99,
      description: "Made from 100% organic cotton with a classic fit. Perfect for everyday wear.",
      category: "T-Shirts",
      sizes: ["S", "M", "L", "XL"],
      colors: [{ name: "White", value: "#FFFFFF" }, { name: "Black", value: "#000000" }],
      images: ["https://images.pexels.com/photos/6786894/pexels-photo-6786894.jpeg?auto=compress&cs=tinysrgb&w=800"],
      features: ["100% Organic Cotton", "Machine Washable"],
      rating: 4.8,
      reviews: 124,
      createdAt: new Date()
    },
    {
      id: 'sample-2',
      name: "Cozy Pullover Hoodie",
      price: 59.99,
      description: "Comfortable hoodie perfect for casual wear and layering.",
      category: "Hoodies",
      sizes: ["M", "L", "XL"],
      colors: [{ name: "Gray", value: "#6B7280" }, { name: "Black", value: "#000000" }],
      images: ["https://images.pexels.com/photos/3253490/pexels-photo-3253490.jpeg?auto=compress&cs=tinysrgb&w=800"],
      features: ["Cotton Blend", "Kangaroo Pocket"],
      rating: 4.9,
      reviews: 87,
      createdAt: new Date()
    }
  ];

  localStorage.setItem('s2-wear-products', JSON.stringify(sampleProducts));
  return sampleProducts;
}

// Get single product
export async function getProduct(id: string): Promise<Product | null> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Product;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting product:', error);
    throw error;
  }
}

// Add new product
export async function addProduct(product: Omit<Product, 'id'>): Promise<string> {
  const productData = {
    ...product,
    rating: 4.5, // Default rating
    reviews: 0, // Default reviews
    createdAt: new Date(),
    updatedAt: new Date()
  };

  let productId: string;

  try {
    console.log('Adding product to Firebase:', product.name);
    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), productData);
    productId = docRef.id;
    console.log('Product added to Firebase with ID:', productId);
  } catch (error) {
    console.error('Error adding product to Firebase, using localStorage fallback:', error);
    productId = Date.now().toString();
  }

  // Always update localStorage for immediate UI updates
  const productWithId = {
    ...productData,
    id: productId
  };

  const existingProducts = await getProducts();
  const updatedProducts = [productWithId, ...existingProducts.filter(p => p.id !== productId)];
  localStorage.setItem('s2-wear-products', JSON.stringify(updatedProducts));
  console.log('Product saved to localStorage, total products:', updatedProducts.length);

  return productId;
}

// Update product
export async function updateProduct(id: string, product: Partial<Product>): Promise<void> {
  const updateData = {
    ...product,
    updatedAt: new Date()
  };

  try {
    console.log('Updating product in Firebase:', id);
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    await updateDoc(docRef, updateData);
    console.log('Product updated in Firebase successfully');
  } catch (error) {
    console.error('Error updating product in Firebase, using localStorage fallback:', error);
  }

  // Always update localStorage for immediate UI updates
  const existingProducts = await getProducts();
  const updatedProducts = existingProducts.map(p =>
    p.id === id
      ? { ...p, ...updateData }
      : p
  );
  localStorage.setItem('s2-wear-products', JSON.stringify(updatedProducts));
  console.log('Product updated in localStorage');
}

// Delete product
export async function deleteProduct(id: string): Promise<void> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

// Upload product image
export async function uploadProductImage(file: File, productId: string): Promise<string> {
  console.log('Attempting Firebase upload for:', file.name, 'Size:', file.size);

  try {
    // Test Firebase connection first
    if (!storage) {
      throw new Error('Firebase storage not initialized');
    }

    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `products/${productId}/${timestamp}_${cleanFileName}`;
    const storageRef = ref(storage, filename);

    console.log('Uploading to Firebase path:', filename);

    // Upload file with timeout
    const uploadPromise = uploadBytes(storageRef, file);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Upload timeout')), 30000)
    );

    const snapshot = await Promise.race([uploadPromise, timeoutPromise]) as any;
    const downloadURL = await getDownloadURL(snapshot.ref);

    console.log('Firebase upload successful:', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error('Firebase upload failed:', error);

    // Re-throw the error so the caller can handle it
    // (ProductForm will convert to base64 as fallback)
    throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Delete product image
export async function deleteProductImage(imageUrl: string): Promise<void> {
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}
