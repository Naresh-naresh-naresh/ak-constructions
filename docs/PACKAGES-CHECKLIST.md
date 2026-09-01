# Construction packages — what we need from AK before this goes live

The packages section is built and tested. It is switched **off** until the table
below is filled in, because every line in it is a public promise about what a
customer gets for their money. Competitors publish specific brands and grades;
we can only publish AK's.

## How to turn it on

1. Get the answers below from Balaji.
2. Fill them into `src/config/packages.ts` — the labels there match this sheet
   one-for-one, so it is a copy-paste job.
3. Set `enabled: true` in the same file. That is the only switch: it reveals the
   homepage section and adds "Packages" to the header nav together.

Partial answers are fine to ship. Any row left blank is skipped, and a category
with no answers at all disappears — so AK can launch with Structure and Flooring
filled in and add the rest later, without the page looking broken.

## Two things to settle first

**1. Are there three packages, or one?**
Right now AK quotes a single rate, ₹1,899/sq ft. The comparison layout needs
three. Either Balaji sets two higher tiers with genuinely better materials, or we
drop to a single-package layout — say which, because it changes the design, not
just the numbers.

**2. Only commit to what AK will actually supply.**
Every row is deletable. A shorter, honest list beats a long one AK has to argue
about on site later. If a brand varies by availability, write the standard we
guarantee instead ("53-grade OPC, ISI marked") rather than naming one brand.

## The sheet

Fill in three columns per row. Leave blank anything AK won't commit to.

### Design & Project Management
| Item | Standard | Premium | Ultra Luxury |
|---|---|---|---|
| Architectural drawings | | | |
| 3D elevation | | | |
| Interior design consultation | | | |
| Structural consultant | | | |
| Site supervision | | | |
| Expected duration | | | |

### Structure
| Item | Standard | Premium | Ultra Luxury |
|---|---|---|---|
| Cement (brand / grade) | | | |
| Steel — TMT (brand / grade) | | | |
| Concrete grade — footing & columns | | | |
| Concrete grade — slab | | | |
| Blocks / bricks | | | |
| External wall thickness | | | |
| Internal wall thickness | | | |
| Floor-to-ceiling height | | | |

### Bathroom & Plumbing
| Item | Standard | Premium | Ultra Luxury |
|---|---|---|---|
| CP fittings (brand, ₹ allowance) | | | |
| Sanitaryware (brand, ₹ allowance) | | | |
| Wall tiles (₹/sq ft allowance) | | | |
| Floor tiles (₹/sq ft allowance) | | | |
| Plumbing pipes (brand) | | | |
| Overhead water tank (brand, litres) | | | |

### Flooring
| Item | Standard | Premium | Ultra Luxury |
|---|---|---|---|
| Living & dining (₹/sq ft allowance) | | | |
| Bedrooms | | | |
| Kitchen | | | |
| Balcony & utility | | | |
| Staircase | | | |
| Skirting | | | |

### Kitchen & Dining
| Item | Standard | Premium | Ultra Luxury |
|---|---|---|---|
| Countertop | | | |
| Dado tiles | | | |
| Sink | | | |
| Modular units | | | |
| Appliance & RO points | | | |

### Doors, Windows & Railing
| Item | Standard | Premium | Ultra Luxury |
|---|---|---|---|
| Main door | | | |
| Internal doors | | | |
| Bathroom doors | | | |
| Windows | | | |
| Window grills | | | |
| Staircase railing | | | |
| Balcony railing | | | |

### Electrical & Painting
| Item | Standard | Premium | Ultra Luxury |
|---|---|---|---|
| Wiring (brand) | | | |
| Switches & sockets (brand) | | | |
| Interior paint (brand / type) | | | |
| Exterior paint (brand / type) | | | |
| Putty & primer | | | |
| Light & fan points (count per room) | | | |

### Also confirm
- Rate per sq ft for each of the three packages.
- What the rate does **not** include (currently the page says government
  approvals, compound wall and landscaping are quoted separately — is that right?).
- Whether the rate is on built-up area or carpet area.
