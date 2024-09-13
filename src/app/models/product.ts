export class Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  type: string;
  name2: string;
  weight: number;s


  constructor(id, name, description = '', price = 0,type,name2,weight, imageUrl)
   {
    this.id = id
    this.name = name
    this.description = description
    this.price = price
    this.type = type
    this.name2 = name2
    this.weight = weight


    this.imageUrl = imageUrl
  }
}
