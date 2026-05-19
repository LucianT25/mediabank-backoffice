export interface Manufacturer {
    id: string;

    name: string;

    key: string;

    address: string;

    website?: string;

    active?: boolean;
}

export interface ManufacturerStub {
    id: string;
    name: string;
    active: boolean;
  }
  