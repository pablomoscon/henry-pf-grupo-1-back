import { Room } from '../../modules/rooms/entities/room.entity';
import { RoomFeatures } from '../../enums/rooms-features.enum';

export const roomsMock: Room[] = [
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: "5 star Suite",
    description:
      "A cozy and luxurious suite with a hiding place, hammocks, scratchers, and suspension bridges to keep your cat entertained all day long.",
    imgs:["https://hoteldegatos.com.ar/wp-content/uploads/2023/06/SURCATIO3-Custom-e1686353508572.png"],
    features: [RoomFeatures.HidingPlace, RoomFeatures.Hammocks, RoomFeatures.Scratchers, RoomFeatures.SuspensionBridges],
    number_of_cats: 1,
    price: 200.0,
    available: true,
    deleted_at: null,
    reservations: [],
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174001',
    name: "Elite Suite",
    description:
      "A spacious room designed for cats to relax and play, featuring multiple hammocks, scratchers, and a cozy hiding spot.",
    imgs: ["https://hoteldegatos.com.ar/wp-content/uploads/2023/03/l3.jpg"],
    features: [RoomFeatures.HidingPlace, RoomFeatures.Scratchers],
    number_of_cats: 2,
    price: 350.0, 
    available: true,
    deleted_at: null,
    reservations: [],
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174002',
    name: "Luxury Suite",
    description:
      "This suite offers comfort and fun with hammocks, scratchers, and bridges, perfect for active cats.",
    imgs: ["https://hoteldegatos.com.ar/wp-content/uploads/2023/03/circ1.jpg"],
    features: [RoomFeatures.Hammocks, RoomFeatures.Scratchers],
    number_of_cats: 3,
    price: 250.0,
    available: true,
    deleted_at: null,
    reservations: [],
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174003',
    name: "Sensational Suite",
    description:
      "An exclusive suite for cats who love climbing and scratching, with suspension bridges and comfy hammocks.",
    imgs: ["https://hoteldegatos.com.ar/wp-content/uploads/2023/06/norte-1-e1686352024825.png"],
    features: [RoomFeatures.Hammocks, RoomFeatures.Scratchers, RoomFeatures.SuspensionBridges],
    number_of_cats: 1,
    price: 300.0,
    available: true,
    deleted_at: null,
    reservations: [],
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174004',
    name: "Capital Suite",
    description:
      "Perfect for solo feline guests, this suite includes a hiding place, scratchers, and a hammock for ultimate relaxation.",
    imgs: ["https://hoteldegatos.com.ar/wp-content/uploads/2023/06/sur1-Custom-e1686353484384.png"],
    features: [RoomFeatures.HidingPlace, RoomFeatures.Hammocks, RoomFeatures.Scratchers],
    number_of_cats: 1,
    price: 200.0,
    available: true,
    deleted_at: null,
    reservations: [],
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174005',
    name: "Jungle Suite",
    description:
      "A premium suite designed for adventurous cats, featuring all the amenities for climbing, scratching, and hiding.",
    imgs: ["https://hoteldegatos.com.ar/wp-content/uploads/2023/06/01-hab-SURCATIO2-Custom-e1686353398819.png"],
    features: [RoomFeatures.HidingPlace, RoomFeatures.SuspensionBridges],
    number_of_cats: 2,
    price: 400.0,
    available: true,
    deleted_at: null,
    reservations: [],
  },

  {
    id: '123e4567-e89b-12d3-a456-426614174006',
    name: "Royal Paws Suite",
    description:
      "A relaxing suite with a focus on comfort, offering a hiding place and hammocks to make your cat feel at home.",
    imgs: ["https://hoteldegatos.com.ar/wp-content/uploads/2023/06/penth-B-Custom-rotated-e1686354014751.jpg"],
    features: [RoomFeatures.HidingPlace, RoomFeatures.Hammocks],
    number_of_cats: 2,
    price: 250.0,
    available: true,
    deleted_at: null,
    reservations: [],
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174007',
    name: "Bridge Paradise Suite",
    description:
      "A luxury suite with suspension bridges, hammocks, and scratchers for the ultimate cat experience.",
    imgs: ["https://hoteldegatos.com.ar/wp-content/uploads/2023/06/06-Custom-e1686357279202.jpg"],
    features: [RoomFeatures.Hammocks, RoomFeatures.Scratchers, RoomFeatures.SuspensionBridges],
    number_of_cats: 4,
    price: 500.0,
    available: true,
    deleted_at: null,
    reservations: [],
  }
];
