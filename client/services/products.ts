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
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const q = query(productsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
  } catch (error) {
    console.error('Error getting products from Firebase, using localStorage fallback:', error);

    // Fallback to localStorage
    const localProducts = localStorage.getItem('s2-wear-products');
    if (localProducts) {
      try {
        return JSON.parse(localProducts);
      } catch {
        return [];
      }
    }
    return [];
  }
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
  try {
    const productData = {
      ...product,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), productData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding product to Firebase, using localStorage fallback:', error);

    // Fallback to localStorage
    const newId = Date.now().toString();
    const productWithId = {
      ...product,
      id: newId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const existingProducts = await getProducts();
    const updatedProducts = [...existingProducts, productWithId];
    localStorage.setItem('s2-wear-products', JSON.stringify(updatedProducts));

    return newId;
  }
}

// Update product
export async function updateProduct(id: string, product: Partial<Product>): Promise<void> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    const updateData = {
      ...product,
      updatedAt: new Date()
    };

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating product in Firebase, using localStorage fallback:', error);

    // Fallback to localStorage
    const existingProducts = await getProducts();
    const updatedProducts = existingProducts.map(p =>
      p.id === id
        ? { ...p, ...product, updatedAt: new Date() }
        : p
    );
    localStorage.setItem('s2-wear-products', JSON.stringify(updatedProducts));
  }
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
  try {
    const timestamp = Date.now();
    const filename = `products/${productId}/${timestamp}_${file.name}`;
    const storageRef = ref(storage, filename);

    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error('Error uploading image to Firebase, using placeholder:', error);

    // Fallback to placeholder images based on file type
    const placeholderImages = [
      'https://images.pexels.com/photos/6786894/pexels-photo-6786894.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3253490/pexels-photo-3253490.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/6276009/pexels-photo-6276009.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/10481315/pexels-photo-10481315.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/4887245/pexels-photo-4887245.jpeg?auto=compress&cs=tinysrgb&w=800'
    ];

    // Return a random placeholder image
    const randomIndex = Math.floor(Math.random() * placeholderImages.length);
    return placeholderImages[randomIndex];
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
