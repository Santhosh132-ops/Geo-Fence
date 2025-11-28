import { Zone } from '../domain/types';

export const ZONES: Zone[] = [
    {
        id: 'downtown',
        name: 'City Center',
        polygon: [
            { lat: 51.5150, lng: -0.1300 },
            { lat: 51.5150, lng: -0.1200 },
            { lat: 51.5050, lng: -0.1200 },
            { lat: 51.5050, lng: -0.1300 }
        ]
    },
    {
        id: 'hydepark',
        name: 'Hyde Park',
        polygon: [
            { lat: 51.5110, lng: -0.1750 },
            { lat: 51.5110, lng: -0.1600 },
            { lat: 51.5030, lng: -0.1600 },
            { lat: 51.5030, lng: -0.1750 }
        ]
    },
    {
        id: 'palace',
        name: 'Buckingham Palace',
        polygon: [
            { lat: 51.5030, lng: -0.1450 },
            { lat: 51.5030, lng: -0.1380 },
            { lat: 51.5000, lng: -0.1380 },
            { lat: 51.5000, lng: -0.1450 }
        ]
    },
    {
        id: 'eye',
        name: 'London Eye',
        polygon: [
            { lat: 51.5040, lng: -0.1200 },
            { lat: 51.5040, lng: -0.1180 },
            { lat: 51.5025, lng: -0.1180 },
            { lat: 51.5025, lng: -0.1200 }
        ]
    },
    {
        id: 'shard',
        name: 'The Shard',
        polygon: [
            { lat: 51.5055, lng: -0.0875 },
            { lat: 51.5055, lng: -0.0855 },
            { lat: 51.5035, lng: -0.0855 },
            { lat: 51.5035, lng: -0.0875 }
        ]
    },
    {
        id: 'tower',
        name: 'Tower of London',
        polygon: [
            { lat: 51.5090, lng: -0.0770 },
            { lat: 51.5090, lng: -0.0740 },
            { lat: 51.5070, lng: -0.0740 },
            { lat: 51.5070, lng: -0.0770 }
        ]
    },
    {
        id: 'museum',
        name: 'British Museum',
        polygon: [
            { lat: 51.5200, lng: -0.1280 },
            { lat: 51.5200, lng: -0.1250 },
            { lat: 51.5180, lng: -0.1250 },
            { lat: 51.5180, lng: -0.1280 }
        ]
    },
    {
        id: 'abbey',
        name: 'Westminster Abbey',
        polygon: [
            { lat: 51.5000, lng: -0.1290 },
            { lat: 51.5000, lng: -0.1270 },
            { lat: 51.4985, lng: -0.1270 },
            { lat: 51.4985, lng: -0.1290 }
        ]
    },
    {
        id: 'stpauls',
        name: 'St Pauls Cathedral',
        polygon: [
            { lat: 51.5145, lng: -0.1000 },
            { lat: 51.5145, lng: -0.0980 },
            { lat: 51.5130, lng: -0.0980 },
            { lat: 51.5130, lng: -0.1000 }
        ]
    }
];
