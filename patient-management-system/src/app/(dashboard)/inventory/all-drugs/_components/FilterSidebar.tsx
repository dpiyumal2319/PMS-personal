"use client"

import {useState, useEffect, useRef} from "react"
import {useRouter} from "next/navigation"
import {Button} from "@/components/ui/button"
import {ScrollArea} from "@/components/ui/scroll-area"
import {Accordion} from "@/components/ui/accordion"
import {Drawer, DrawerContent, DrawerTrigger, DrawerClose} from "@/components/ui/drawer"
import {FilterSection, FilterSectionOnlyName, FilterSectionRef} from "./FilterSections"
import {FilterIcon, RefreshCw, X} from "lucide-react"
import {cn} from "@/lib/utils"

// Import the fetching functions
import {
    fetchDrugTypes,
    fetchDrugModels,
    fetchDrugBrands,
    fetchSuppliers,
    fetchBatchStatuses
} from "../lib/dataFetch"

interface FilterDrawerProps {
    className?: string
}

export function FilterDrawer({className}: FilterDrawerProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)

    // State to store filter options
    const [drugType, setDrugType] = useState<string[]>([])
    const [drugModel, setDrugModel] = useState<{
        id: number
        name: string
    }[]>([])
    const [drugBrands, setDrugBrands] = useState<{ name: string; id: number }[]>([])
    const [suppliers, setSuppliers] = useState<{ name: string; id: number }[]>([])
    const [batchStatuses, setBatchStatuses] = useState<string[]>([])

    // State to manage loading, error, and button states
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [applying, setApplying] = useState(false)
    const [resetting, setResetting] = useState(false)
    const [activeFiltersCount, setActiveFiltersCount] = useState(0)

    // Fetch filter options on component mount
    useEffect(() => {
        async function loadFilterOptions() {
            try {
                setIsLoading(true)
                const [
                    fetchedDrugType,
                    fetchedDrugModels,
                    fetchedDrugBrands,
                    fetchedSuppliers,
                    fetchedBatchStatuses,
                ] = await Promise.all([
                    fetchDrugTypes(),
                    fetchDrugModels(),
                    fetchDrugBrands(),
                    fetchSuppliers(),
                    fetchBatchStatuses(),
                ])

                setDrugType(fetchedDrugType)
                setDrugModel(fetchedDrugModels)
                setDrugBrands(fetchedDrugBrands)
                setSuppliers(fetchedSuppliers)
                setBatchStatuses(fetchedBatchStatuses)
            } catch (err) {
                console.error("Failed to fetch filter options:", err)
                setError("Failed to load filter options")
            } finally {
                setIsLoading(false)
            }
        }

        loadFilterOptions()
    }, [])

    // Parse URL on mount to count active filters
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        let count = 0

        // Count all filter parameters
        params.forEach((value) => {
            count += value.split(',').length
        })

        setActiveFiltersCount(count)
    }, [])

    const filterRefs = useRef<(FilterSectionRef | null)[]>([])

    const handleApplyFilters = async () => {
        setApplying(true)

        try {
            // Collect all selected filters from refs
            const filterParams = new URLSearchParams()
            let totalSelectedItems = 0

            filterRefs.current.forEach((ref) => {
                if (ref?.getSelectedItems) {
                    const {id, selectedItems} = ref.getSelectedItems()
                    if (selectedItems.length > 0) {
                        filterParams.set(id, selectedItems.join(","))
                        totalSelectedItems += selectedItems.length
                    }
                }
            })

            setActiveFiltersCount(totalSelectedItems)

            const search = filterParams.toString()
            const query = search ? `?${search}` : ""

            await router.push(`${window.location.pathname}${query}`, {scroll: false})

            // Close drawer after applying filters
            setTimeout(() => {
                setApplying(false)
                setOpen(false)
            }, 500)
        } catch (error) {
            console.error("Error applying filters:", error)
            setApplying(false)
        }
    }

    const handleResetFilters = async () => {
        setResetting(true)

        try {
            filterRefs.current.forEach((ref) => ref?.reset())
            setActiveFiltersCount(0)

            // Clear URL params
            router.push(window.location.pathname, {scroll: false})

            // Keep the resetting state visible briefly for user feedback
            setTimeout(() => {
                setResetting(false)
                setOpen(false)
            }, 500)
        } catch (error) {
            console.error("Error resetting filters:", error)
            setResetting(false)
        }
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button
                    variant="outline"
                    className={cn("flex items-center gap-2", className)}
                >
                    <FilterIcon size={16}/>
                    <span>Filters</span>
                    {activeFiltersCount > 0 && (
                        <span
                            className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-primary text-primary-foreground rounded-full">
              {activeFiltersCount}
            </span>
                    )}
                </Button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[80vh]">
                <div className="max-w-md mx-auto w-full">
                    <div className="p-4 border-b flex items-center justify-between">
                        <div>
                            <h3 className="font-medium text-lg">Filters</h3>
                            <p className="text-sm text-gray-500">Refine your inventory view</p>
                        </div>
                        <DrawerClose asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <X className="h-4 w-4"/>
                                <span className="sr-only">Close</span>
                            </Button>
                        </DrawerClose>
                    </div>

                    {isLoading ? (
                        <div className="p-8 flex items-center justify-center">
                            <p className="flex items-center">
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin"/>
                                Loading filters...
                            </p>
                        </div>
                    ) : error ? (
                        <div className="p-8 flex items-center justify-center">
                            <p className="text-red-500">{error}</p>
                        </div>
                    ) : (
                        <>
                            <ScrollArea className="max-h-[calc(80vh-12rem)]">
                                <div className="p-4">
                                    <Accordion type="multiple" defaultValue={["drugModel"]}>
                                        <FilterSection
                                            ref={(el) => {
                                                filterRefs.current[2] = el
                                            }}
                                            id="drugModel"
                                            title="Drug Model"
                                            items={drugModel}
                                            applyOnClick={false}
                                        />

                                        <FilterSection
                                            ref={(el) => {
                                                filterRefs.current[3] = el
                                            }}
                                            id="drugBrand"
                                            title="Drug Brand"
                                            items={drugBrands}
                                            applyOnClick={false}
                                        />

                                        <FilterSection
                                            ref={(el) => {
                                                filterRefs.current[4] = el
                                            }}
                                            id="supplier"
                                            title="Supplier"
                                            items={suppliers}
                                            applyOnClick={false}
                                        />

                                        <FilterSectionOnlyName
                                            ref={(el) => {
                                                filterRefs.current[0] = el
                                            }}
                                            id="drugType"
                                            title="Drug Type"
                                            items={drugType}
                                            applyOnClick={false}
                                        />

                                        <FilterSectionOnlyName
                                            ref={(el) => {
                                                filterRefs.current[1] = el
                                            }}
                                            id="batchStatus"
                                            title="Batch Status"
                                            items={batchStatuses}
                                            applyOnClick={false}
                                        />
                                    </Accordion>
                                </div>
                            </ScrollArea>

                            <div className="p-4 border-t space-y-3">
                                <Button className="w-full relative" onClick={handleApplyFilters} disabled={applying}>
                  <span className={`transition-opacity ${applying ? "opacity-0" : "opacity-100"}`}>
                    Apply Filters
                  </span>
                                    {applying && (
                                        <span className="absolute inset-0 flex items-center justify-center">
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin"/>
                      Applying...
                    </span>
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full relative"
                                    size="sm"
                                    onClick={handleResetFilters}
                                    disabled={resetting}
                                >
                  <span className={`flex items-center transition-opacity ${resetting ? "opacity-0" : "opacity-100"}`}>
                    <RefreshCw className="h-3.5 w-3.5 mr-2"/>
                    Reset Filters
                  </span>
                                    {resetting && (
                                        <span className="absolute inset-0 flex items-center justify-center">
                      <RefreshCw className="h-3.5 w-3.5 mr-2 animate-spin"/>
                      Resetting...
                    </span>
                                    )}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </DrawerContent>
        </Drawer>
    )
}