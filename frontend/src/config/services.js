export const serviceCategories = {
  "Featured Tasks": [
    "Furniture Assembly", "Home Repairs", "Help Moving", "Yard Work Services", 
    "Spring Cleaning", "TV Mounting", "Plumbing", "Hang Art, Mirror & Decor", 
    "Electrical Help", "Wait in Line", "Closet Organization Service"
  ],
  "Handyman": [
    "Door, Cabinet, & Furniture Repair", "Appliance Installation & Repairs", 
    "Furniture Assembly", "TV Mounting", "Drywall Repair Service", 
    "Flooring & Tiling Help", "Electrical Help", "Sealing & Caulking", 
    "Plumbing", "Window & Blinds Repair", "Ceiling Fan Installation", 
    "Smart Home Installation", "Heavy Lifting", "Install Air Conditioner", 
    "Painting", "Install Shelves, Rods & Hooks", "Home Maintenance", 
    "Install Blinds & Window Treatments", "Home Repairs", "Baby Proofing", 
    "Yard Work Services"
  ],
  "Moving Services": [
    "Help Moving", "Truck Assisted Help Moving", "Packing Services & Help", 
    "Unpacking Services", "Heavy Lifting", "Local Movers", "Junk Pickup", 
    "Furniture Movers", "One Item Movers", "Storage Unit Moving", "Couch Removal", 
    "Mattress Pick-Up & Removal", "Furniture Removal", "Pool Table Movers", 
    "Appliance Removal", "Heavy Furniture Moving", "Rearranging Furniture", 
    "Full Service Help Moving", "In-Home Furniture Movers"
  ],
  "Furniture Assembly": [
    "Furniture Assembly", "Patio Furniture Assembly", "Desk Assembly", 
    "Dresser Assembly", "Bed Assembly", "Bookshelf Assembly", "Couch Assembly", 
    "Chair Assembly", "Wardrobe Assembly", "Table Assembly", "Disassemble furniture"
  ],
  "Mounting & Installation": [
    "TV Mounting", "Install Shelves, Rods & Hooks", "Ceiling Fan Installation", 
    "Install Blinds & Window Treatments", "Hang Art, Mirror & Decor", 
    "General Mounting", "Hang Christmas Lights"
  ],
  "Cleaning": [
    "House Cleaning Services", "Deep Cleaning", "Disinfecting Services", 
    "Move In Cleaning", "Move Out Cleaning", "Vacation Rental Cleaning", 
    "Carpet Cleaning Service", "Garage Cleaning", "One Time Cleaning Services", 
    "Car Washing", "Laundry Help", "Pressure Washing", "Spring Cleaning"
  ],
  "Shopping & Delivery": [
    "Delivery Service", "Grocery Shopping & Delivery", "Running Your Errands", 
    "Christmas Tree Delivery", "Wait in Line", "Deliver Big Piece of Furniture", 
    "Drop Off Donations", "Contactless Delivery", "Pet Food Delivery", 
    "Baby Food Delivery", "Return Items", "Wait for Delivery", "Shipping", 
    "Breakfast Delivery", "Coffee Delivery"
  ],
  "IKEA Services": [
    "Light Installation", "Furniture Removal", "Smart Home Installation", 
    "Organization", "Furniture Assembly", "General Mounting"
  ],
  "Yardwork Services": [
    "Gardening Services", "Weed Removal", "Lawn Care Services", 
    "Lawn Mowing Services", "Landscaping Services", "Gutter Cleaning", 
    "Tree Trimming Service", "Vacation Plant Watering", "Patio Cleaning", 
    "Hot Tub Cleaning", "Fence Installation & Repair Services", 
    "Deck Restoration Services", "Patio Furniture Assembly", "Fence Staining", 
    "Mulching Services", "Lawn Fertilizer Service", "Hedge Trimming Service", 
    "Outdoor Party Setup", "Urban Gardening Service", "Leaf Raking & Removal"
  ]
};

export const allServices = Array.from(new Set(Object.values(serviceCategories).flat())).sort();
export const allCategories = Object.keys(serviceCategories);
