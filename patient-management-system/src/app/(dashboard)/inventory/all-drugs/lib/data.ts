 // lib/data.ts
 import { Drug, FetchDrugsParams, FetchDrugsResult } from "./types";
  
 // Dummy data generator
 function generateDummyDrugs(count: number): Drug[] {
   const drugs: Drug[] = [];
   
   const drugNames = [
     "Paracetamol", "Ibuprofen", "Amoxicillin", "Azithromycin",
     "Loratadine", "Cetirizine", "Metformin", "Atorvastatin", 
     "Losartan", "Omeprazole", "Ranitidine", "Aspirin", 
     "Diclofenac", "Salbutamol", "Fluoxetine", "Sertraline"
   ];
   
   const brands = [
     "Pfizer", "Novartis", "Roche", "Sanofi", "GSK", "Johnson & Johnson", 
     "Merck", "AstraZeneca", "Abbott", "Bayer", "Bristol Myers Squibb"
   ];
   
   const suppliers = [
     "Supplier A", "Supplier B", "Supplier C", "Distributor X", 
     "Wholesaler Y", "Pharmacy Z", "Medical Supply Co."
   ];
   
   const drugModels = ["Tablet", "Syrup", "Injection", "Capsule", "Cream"];
   
   const batchStatuses = ["Available", "Completed", "Expired", "Disposed", "Quality Failed"];
 
   for (let i = 0; i < count; i++) {
     const fullAmount = Math.floor(Math.random() * 1000) + 100;
     const remainingAmount = Math.floor(Math.random() * fullAmount);
     
     // Generate dates
     const now = new Date();
     
     // Stock date between 1 and 12 months ago
     const stockDate = new Date();
     stockDate.setMonth(now.getMonth() - (Math.floor(Math.random() * 12) + 1));
     
     // Expiry date between now and 24 months in the future
     const expiryDate = new Date();
     expiryDate.setMonth(now.getMonth() + (Math.floor(Math.random() * 24)));
     
     // For expired items, set expiry date in the past
     if (batchStatuses[Math.floor(Math.random() * batchStatuses.length)] === "Expired") {
       expiryDate.setMonth(now.getMonth() - (Math.floor(Math.random() * 6) + 1));
     }
     
     drugs.push({
       id: `drug-${i + 1}`,
       name: drugNames[Math.floor(Math.random() * drugNames.length)],
       brand: brands[Math.floor(Math.random() * brands.length)],
       supplier: suppliers[Math.floor(Math.random() * suppliers.length)],
       batchNumber: `B${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
       stockDate: stockDate.toISOString(),
       expiryDate: expiryDate.toISOString(),
       drugModel: drugModels[Math.floor(Math.random() * drugModels.length)] as any,
       batchStatus: batchStatuses[Math.floor(Math.random() * batchStatuses.length)] as any,
       fullAmount,
       remainingAmount,
       unitConcentration: `${Math.floor(Math.random() * 500) + 10}${Math.random() > 0.5 ? 'mg' : 'ml'}`
     });
   }
   
   return drugs;
 }
 
 // All drugs data (simulating database)
 const allDrugs = generateDummyDrugs(100);
 
 // Server-side function to fetch drugs with filtering, sorting, and pagination
 export async function fetchDrugs({
   page = 1,
   per_page = 10,
   sort = 'expiry_date:asc',
   filters = {}
 }: FetchDrugsParams): Promise<FetchDrugsResult> {
   // Simulate server delay
   await new Promise(resolve => setTimeout(resolve, 500));
   
   // Apply filters
   let filteredDrugs = [...allDrugs];
   
   if (filters.query) {
     const searchTerm = filters.query.toLowerCase();
     filteredDrugs = filteredDrugs.filter(drug => 
       drug.name.toLowerCase().includes(searchTerm) || 
       drug.brand.toLowerCase().includes(searchTerm) ||
       drug.batchNumber.toLowerCase().includes(searchTerm)
     );
   }

   if (filters.drug_name){
      filteredDrugs = filteredDrugs.filter(drug => 
        drug.name.toLowerCase() === filters.drug_name?.toLowerCase()
      );
   }
   
   if (filters.drug_brand) {
     filteredDrugs = filteredDrugs.filter(drug => 
       drug.brand.toLowerCase() === filters.drug_brand?.toLowerCase()
     );
   }
   
   if (filters.supplier) {
     filteredDrugs = filteredDrugs.filter(drug => 
       drug.supplier.toLowerCase() === filters.supplier?.toLowerCase()
     );
   }
   
   if (filters.drug_model) {
     filteredDrugs = filteredDrugs.filter(drug => 
       drug.drugModel.toLowerCase() === filters.drug_model?.toLowerCase()
     );
   }
   
   if (filters.batch_status) {
     filteredDrugs = filteredDrugs.filter(drug => 
       drug.batchStatus.toLowerCase() === filters.batch_status?.toLowerCase()
     );
   }
   
   // Apply sorting
   const [sortField, sortDirection] = sort.split(':');
   
   filteredDrugs.sort((a: any, b: any) => {
     let aValue = a[sortField];
     let bValue = b[sortField];
     
     // Handle special cases for proper sorting
     if (sortField === 'expiry_date' || sortField === 'stock_date') {
       aValue = new Date(aValue).getTime();
       bValue = new Date(bValue).getTime();
     }
     
     if (sortDirection === 'asc') {
       return aValue > bValue ? 1 : -1;
     } else {
       return aValue < bValue ? 1 : -1;
     }
   });
   
   // Apply pagination
   const totalItems = filteredDrugs.length;
   const totalPages = Math.ceil(totalItems / per_page);
   
   // Get requested page
   const start = (page - 1) * per_page;
   const end = start + per_page;
   const paginatedDrugs = filteredDrugs.slice(start, end);
   
   return {
     data: paginatedDrugs,
     totalItems,
     totalPages
   };
 }