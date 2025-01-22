import { Location } from '../../modules/locations/entities/location.entity';

export const locationsMock: Location[] = [
  {
    id: '123e4567-e89b-12d3-a456-426614174100',
    name: 'Sede Libertador',
    address: 'Libertador 2000',
    city: 'Capital Federal',
    country: 'Argentina',
    coordinates: { lat: 24.3153102, lng: -75.7379289 },
    capacity: 20,
    open: true,
    rooms: [],
    caretakers: [],
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174101',
    name: 'Sede Vicente López',
    address: 'Eduardo Madero 1215',
    city: 'Vicente López, Buenos Aires',
    country: 'Argentina',
    coordinates: { lat: 24.3153102, lng: -75.7379289 },
    capacity: 10,
    open: true,
    rooms: [],
    caretakers: [],
  },
];
