
export type MockupStyle = 'male-model' | 'female-model' | 'flat-lay' | 'hanging';
export type ClothingType = 't-shirt' | 'hoodie' | 'shirt';

export const MOCKUP_STYLES: { id: MockupStyle; name: string }[] = [
    { id: 'male-model', name: 'Male Model' },
    { id: 'female-model', name: 'Female Model' },
    { id: 'flat-lay', name: 'Flat Lay' },
    { id: 'hanging', name: 'Hanging' },
];

export const CLOTHING_TYPES: { id: ClothingType; name: string }[] = [
    { id: 't-shirt', name: 'T-Shirt' },
    { id: 'hoodie', name: 'Hoodie' },
    { id: 'shirt', name: 'Shirt' },
];

export interface GeneratedImage {
  id: string;
  src: string;
}
