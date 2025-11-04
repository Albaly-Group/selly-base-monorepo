"use client"

import { useState, useMemo, useCallback, ChangeEvent } from "react"
import { Navigation } from "@/components/navigation"
import { CompanySearch } from "@/components/company-search"
import { CompanyTable } from "@/components/company-table"
import { AddToListDialog } from "@/components/add-to-list-dialog"
import { CompanyDetailDrawer } from "@/components/company-detail-drawer"
import { CompanyCreateDialog } from "@/components/company-create-dialog"
import { SmartFilteringPanel, type SmartFilteringCriteria } from "@/components/smart-filtering-panel"
import { requireAuth } from "@/lib/auth"
import { useCompaniesSearch } from "@/lib/hooks/api-hooks"
import { searchAndScoreCompanies, type WeightedLeadScore, calculateWeightedLeadScore } from "@/lib/types"
import type { Company } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Filter, Loader2, Plus } from "lucide-react"
import ExcelJS from 'exceljs';
import { apiClient } from '@/lib/api-client'

function CompanyLookupPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [smartFiltering, setSmartFiltering] = useState<SmartFilteringCriteria>({})
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])
  const [showAddToListDialog, setShowAddToListDialog] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showSmartFilteringDialog, setShowSmartFilteringDialog] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [showCompanyDetail, setShowCompanyDetail] = useState(false)
  const [hasAppliedFiltering, setHasAppliedFiltering] = useState(false)
  const [isSimpleSearch, setIsSimpleSearch] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Export modal / selected fields
  const exportFieldDefs = useMemo(() => ([
    { key: 'name_en', label: 'Company Name', get: (c: any) => c.companyNameEn || '' },
    { key: 'name_th', label: 'Name (TH)', get: (c: any) => c.companyNameTh || '' },
    { key: 'name_local', label: 'Local Name', get: (c: any) => c.companyNameLocal || '' },
    { key: 'primary_registration_no', label: 'Registration No', get: (c: any) => c.primaryRegistrationNo || '' },
    { key: 'registration_country_code', label: 'Registration Country', get: (c: any) => c.registrationCountryCode || '' },
    { key: 'duns_number', label: 'DUNS Number', get: (c: any) => c.dunsNumber || '' },
    { key: 'address_line_1', label: 'Address Line 1', get: (c: any) => c.addressLine1 || c.address1 || '' },
    { key: 'address_line_2', label: 'Address Line 2', get: (c: any) => c.addressLine2 || c.address2 || '' },
    { key: 'postal_code', label: 'Postal Code', get: (c: any) => c.postalCode || '' },
    { key: 'business_description', label: 'Business Description', get: (c: any) => c.businessDescription || c.description || '', wrapText: true },
    { key: 'established_date', label: 'Established Date', get: (c: any) => c.establishedDate || c.registrationDate || null, type: 'date' },
    { key: 'employee_count_estimate', label: 'Employee Count Estimate', get: (c: any) => c.employeeCountEstimate || null, type: 'number' },
    { key: 'company_size', label: 'Company Size', get: (c: any) => c.companySize || '' },
    { key: 'annual_revenue_estimate', label: 'Annual Revenue Estimate', get: (c: any) => c.annualRevenueEstimate || null, type: 'number' },
    { key: 'currency_code', label: 'Currency Code', get: (c: any) => c.currencyCode || '' },
    { key: 'website_url', label: 'Website', get: (c: any) => c.websiteUrl || '' },
    { key: 'linkedin_url', label: 'LinkedIn URL', get: (c: any) => c.linkedinUrl || '' },
    { key: 'facebook_url', label: 'Facebook URL', get: (c: any) => c.facebookUrl || '' },
    { key: 'primary_email', label: 'Primary Email', get: (c: any) => c.primaryEmail || '' },
    { key: 'primary_phone', label: 'Primary Phone', get: (c: any) => c.primaryPhone || '' },
    { key: 'logo_url', label: 'Logo URL', get: (c: any) => c.logoUrl || '' },
    { key: 'primary_industry', label: 'Primary Industry', get: (c: any) => c.primaryIndustryDisplay || c.primaryIndustryId || '' },
    { key: 'primary_region', label: 'Primary Region', get: (c: any) => c.primaryRegionDisplay || c.primaryRegionId || '' },
    { key: 'contact_phones', label: 'Contact Phones', get: (c: any) => 
      {
        const contacts = Array.isArray(c.contactPersons) ? c.contactPersons : [];
        const phones = contacts.map((p: any, idx: number) => (p && p.phone) ? `${p.phone} (contact${idx + 1})` : null).filter(Boolean as any);
        if (phones.length > 0) {
          return `${phones.join(', ')}`;
        }
        if (c.primaryPhone) {
          return `${c.primaryPhone} (primary)`;
        }
        return '';
      } 
    },
    { key: 'contact_emails', label: 'Contact Emails', get: (c: any) => 
      {
        const contacts = Array.isArray(c.contactPersons) ? c.contactPersons : [];
        const emails = contacts.map((p: any, idx: number) => (p && p.email) ? `${p.email} (contact${idx + 1})` : null).filter(Boolean as any);
        if (emails.length > 0) { 
          return `${emails.join(', ')}`;
        }
        if (c.primaryEmail) {
          return `${c.primaryEmail} (primary)`;
        }
        return '';
      } 
    },
    { key: 'data_quality_score', label: 'Data Quality Score', get: (c: any) => typeof c.dataQualityScore === 'number' ? c.dataQualityScore : (c.dataQualityScore ? parseFloat(c.dataQualityScore) : null), type: 'number' },
    { key: 'data_sensitivity', label: 'Data Sensitivity', get: (c: any) => c.dataSensitivity || '' },
    { key: 'verification_status', label: 'Verification Status', get: (c: any) => c.verificationStatus || '' },
    { key: 'last_enriched_at', label: 'Last Enriched At', get: (c: any) => c.lastEnrichedAt ? c.lastEnrichedAt : c.lastUpdated || null, type: 'date' },
  ]), [])

  const [showExportModal, setShowExportModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importUploading, setImportUploading] = useState(false)

  const [selectedExportKeys, setSelectedExportKeys] = useState<string[]>(() => exportFieldDefs.map((f: any) => f.key))

  const apiSearchFilters = useMemo(() => {
    const filters: any = {
      page: currentPage,
      limit: 25,
      _refresh: refreshTrigger,
    };

    if (isSimpleSearch) {

      if(searchTerm.trim()){
        filters.q = searchTerm.trim() || "";
        filters.includeSharedData = true;
      }
    }

    if (hasAppliedFiltering) {
      // Include shared data for smart filtering
      filters.includeSharedData = true;

      // Include keyword if provided in smart filtering
      if (smartFiltering.keyword && smartFiltering.keyword.trim()) {
        filters.q = smartFiltering.keyword.trim();
      }

      // Apply attribute filters
      if (smartFiltering.industrial){
        console.log("Smart", smartFiltering.industrial)
        filters.industrial = smartFiltering.industrial;
      }
      if (smartFiltering.province) {
        filters.province = smartFiltering.province;
      }
      if (smartFiltering.companySize) {
        filters.companySize = smartFiltering.companySize;
      }
      if (smartFiltering.verificationStatus){
        filters.verificationStatus = smartFiltering.verificationStatus;
      }
    }

    return filters;
  }, [searchTerm, smartFiltering, hasAppliedFiltering, isSimpleSearch, currentPage, refreshTrigger]);

  const shouldSearch = isSimpleSearch && searchTerm.trim() || hasAppliedFiltering;
  const { data: apiSearchResult, isLoading: isApiLoading, isError: hasApiError } = useCompaniesSearch(shouldSearch ? apiSearchFilters : {});

  const { filteredCompanies, leadScores, isLoading } = useMemo(() => {
    if (shouldSearch && isApiLoading) {
      return { filteredCompanies: [], leadScores: {}, isLoading: true };
    }

    if (shouldSearch && apiSearchResult && !hasApiError) {
        const companies = apiSearchResult.items.map((item: any) => {
        // Handle industry_classification which can be JSONB array or object
        let industrialName = 'N/A';
        if (item.industryClassification) {
          if (Array.isArray(item.industryClassification)) {
            industrialName = item.industryClassification[0] || 'N/A';
          } else if (typeof item.industryClassification === 'object' && item.industryClassification.name) {
            industrialName = item.industryClassification.name;
          } else if (typeof item.industryClassification === 'string') {
            industrialName = item.industryClassification;
          }
        }

        // Calculate data completeness percentage from quality score (0.0-1.0 to 0-100)
        const qualityScore = parseFloat(item.dataQualityScore) || 0;
        const dataCompleteness = Math.round(qualityScore * 100);

        return {
          // Identifiers
          id: item.id,
          organizationId: item.organizationId,

          // Names
          companyNameEn: item.nameEn,
          companyNameTh: item.nameTh,
          companyNameLocal: item.nameLocal,
          displayName: item.displayName,

          // Registration
          primaryRegistrationNo: item.primaryRegistrationNo,
          registrationId: item.registrationId || item.primaryRegistrationNo,
          registrationCountryCode: item.registrationCountryCode,

          // Standard metadata
          dunsNumber: item.dunsNumber,

          // Address / location
          address1: item.addressLine1,
          addressLine1: item.addressLine1,
          address2: item.addressLine2,
          addressLine2: item.addressLine2,
          postalCode: item.postalCode,
          district: item.district,
          latitude: item.latitude,
          longitude: item.longitude,

          // Business details
          businessDescription: item.businessDescription,
          description: item.businessDescription, // alias for components that expect `description`
          establishedDate: item.establishedDate || item.registrationDate,
          registrationDate: item.establishedDate || item.registrationDate,
          employeeCountEstimate: item.employeeCountEstimate || 0,
          companySize: item.companySize,
          annualRevenueEstimate: item.annualRevenueEstimate,
          currencyCode: item.currencyCode,

          // Web / contact
          websiteUrl: item.websiteUrl,
          linkedinUrl: item.linkedinUrl,
          facebookUrl: item.facebookUrl,
          primaryEmail: item.primaryEmail,
          primaryPhone: item.primaryPhone,
          logoUrl: item.logoUrl,

          // Relations
          primaryIndustryId: item.primaryIndustryId,
          primaryRegionId: item.primaryRegionId,
          industrialName: (item.primaryIndustry && (item.primaryIndustry.titleEn || item.primaryIndustry.titleTh || item.primaryIndustry.code)) || industrialName,
          primaryIndustryDisplay: (item.primaryIndustry && (item.primaryIndustry.titleEn || item.primaryIndustry.titleTh || item.primaryIndustry.code)) || 'N/A',
          primaryRegion: item.primaryRegion || null,
          primaryRegionDisplay: (item.primaryRegion && (item.primaryRegion.nameEn || item.primaryRegion.nameTh || item.primaryRegion.code)) || 'N/A',
          province: (item.primaryRegion && (item.primaryRegion.nameEn || item.primaryRegion.nameTh || item.primaryRegion.code)) || item.province || 'N/A',

          // Scoring / privacy
          verificationStatus: item.verificationStatus || 'unverified',
          dataQualityScore: parseFloat(item.dataQualityScore) || 0,
          qualityScore: qualityScore,
          dataSensitivity: item.dataSensitivity,
          dataCompleteness: dataCompleteness,

          // Contacts
          contactPersons: (item.companyContacts || []).map((contact: any) => ({
            fullName: contact.fullName || `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'N/A',
            name: contact.fullName || `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'N/A',
            phone: contact.phone,
            email: contact.email,
          })),

          // Timestamps and audit
          lastEnrichedAt: item.lastEnrichedAt,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          lastUpdated: item.updatedAt,
          createdBy: item.createdBy || 'system',
        };
      });

      let calculatedLeadScores: { [companyId: string]: WeightedLeadScore } = {};
      if (hasAppliedFiltering && smartFiltering) {
        companies.forEach(company => {
          const score = calculateWeightedLeadScore(company, smartFiltering);
          calculatedLeadScores[company.id] = score;
        });
      }

      return { filteredCompanies: companies, leadScores: calculatedLeadScores, isLoading: false };
    }

    if (hasApiError) {
      console.error('API search failed, no fallback data available');
    }
    
    return { filteredCompanies: [], leadScores: {}, isLoading: false };
  }, [shouldSearch, isApiLoading, apiSearchResult, hasApiError, hasAppliedFiltering, smartFiltering]);

  // Function to refresh data
  const refreshData = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
    // Clear selections when refreshing
    setSelectedCompanies([])
  }, [])

  const handleSelectCompany = (companyId: string, selected: boolean) => {
    if (selected) {
      setSelectedCompanies((prev) => [...prev, companyId])
    } else {
      setSelectedCompanies((prev) => prev.filter((id) => id !== companyId))
    }
  }

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedCompanies(filteredCompanies.map((c) => c.id))
    } else {
      setSelectedCompanies([])
    }
  }

  const onAddToList = () => {
    if (selectedCompanies.length > 0) {
      setShowAddToListDialog(true)
    }
  }

  const onExportExcel = (fieldKeys?: string[]) => {
    // Use ExcelJS for richer styling and better control
    const selectedData = filteredCompanies.filter((c) => selectedCompanies.includes(c.id));

    const chosenKeys = (fieldKeys && fieldKeys.length > 0) ? fieldKeys : selectedExportKeys;
    if (!chosenKeys || chosenKeys.length === 0) {
      alert('Please select at least one column to export.');
      return;
    }

    const fieldsMap: any = Object.fromEntries(exportFieldDefs.map((f: any) => [f.key, f]));

    const headers = chosenKeys.map((k) => (fieldsMap[k] ? fieldsMap[k].label : k));

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Export');

    // Add header row
    ws.addRow(headers);

    // Add data rows dynamically based on selected keys
    selectedData.forEach((company) => {
      const row = chosenKeys.map((key) => {
        const def = fieldsMap[key];
        if (!def) return '';
        const raw = def.get ? def.get(company) : ((company as any)[key] ?? '');
        if (def.type === 'date') {
          return raw ? new Date(raw) : null;
        }
        if (def.type === 'number') {
          return raw == null || raw === '' ? null : Number(raw);
        }
        return raw == null ? '' : raw;
      });
      ws.addRow(row);
    });

    // Style header
    const headerRow = ws.getRow(1);
    headerRow.font = { bold: true, size: 12, name: 'Arial' };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 20;
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, size: 12, name: 'Arial' };
    });

    // Set number/date formats and wrapText where requested
    ws.columns.forEach((col, idx) => {
      const key = chosenKeys[idx];
      const def = fieldsMap[key];
      if (!def) return;
      if (def.type === 'number') {
        try { ws.getColumn(idx + 1).numFmt = '0.00'; } catch (e) {}
      }
      if (def.type === 'date') {
        try { ws.getColumn(idx + 1).numFmt = 'mm/dd/yyyy'; } catch (e) {}
      }
      if (def.wrapText) {
        try { ws.getColumn(idx + 1).alignment = { wrapText: true }; } catch (e) {}
      }
    });

    // Auto column widths (approximate by character length)
    const padding = 2;
    ws.columns.forEach((col) => {
      let max = 10;
      if (col && typeof col.eachCell === 'function') {
        col.eachCell({ includeEmpty: true }, (cell) => {
          const raw = cell && (cell as any).value;
          const val = raw == null ? '' : (typeof raw === 'object' && (raw as any).text ? (raw as any).text : String(raw));
          max = Math.max(max, val.length);
        });
      }
      if (col) col.width = Math.min(Math.max(max + padding, 10), 120);
    });

    // Freeze header
    ws.views = [{ state: 'frozen', ySplit: 1 }];

    // Generate and download
    wb.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `selly-base-export-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }).catch((err) => {
      console.error('Failed to generate XLSX', err);
      alert('Unable to generate Excel file');
    });
  }

  const onSearch = () => {
    if (searchTerm.trim()) {
      setIsSimpleSearch(true)
      setHasAppliedFiltering(false)
      setSelectedCompanies([])
    }
  }

  const onSearchChangeVal = (text: string) => {
    setSearchTerm(text)
    if (!text.trim()) {
      setIsSimpleSearch(false)
    }
  }

  const handleApplySmartFiltering = (criteria: SmartFilteringCriteria) => {
    setSmartFiltering(criteria)
    setHasAppliedFiltering(true)
    setIsSimpleSearch(false)
    setSelectedCompanies([])
  }

  const clearFilters = () => {
    setSmartFiltering({})
    setHasAppliedFiltering(false)
    setIsSimpleSearch(false)
    setSearchTerm("")
    setSelectedCompanies([])
  }

  const ViewCompany = (company: any) => {
    console.log("Compay", company)
    setSelectedCompany(company)
    setShowCompanyDetail(true)
  }

  const handleCreateSuccess = (newCompany: Company) => {
    console.log("Company created successfully:", newCompany)
    // Refresh the data to show new company
    refreshData()
  }

  // Handle company edit/update success
  const handleCompanyUpdate = useCallback((updatedCompany: Company) => {
    console.log("Company updated successfully:", updatedCompany)
    // Refresh the data to show updated company
    refreshData()
    
    // Close any open dialogs
    setShowCompanyDetail(false)
  }, [refreshData])

  // Handle list operations success
  const handleAddToListSuccess = useCallback(() => {
    setSelectedCompanies([])
    setShowAddToListDialog(false)
    // Optionally refresh if list operations affect company data
    // refreshData()
  }, [])

  const hasResults = isSimpleSearch || hasAppliedFiltering

  // Helper to safely extract message from unknown errors
  const getErrorMessage = (err: unknown) => {
    if (!err) return String(err)
    if (err instanceof Error) return err.message
    if (typeof err === 'string') return err
    try {
      // try to read .message if present on object-like errors
      if (typeof err === 'object' && err !== null && 'message' in err) {
        return String((err as any).message)
      }
      return JSON.stringify(err)
    } catch {
      return String(err)
    }
  }

  // Move heavy handlers out of JSX
  const handleUploadAndValidate = async () => {
    if (!importFile) return
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Company Lookup</h1>
          <p className="text-gray-600">Search and discover companies in our database</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <h3 className="font-medium mb-2 mt-2">All Companies</h3>

          <TabsContent value="all" className="space-y-6">
            {/* Search Section */}
            <CompanySearch
              searchTerm={searchTerm}
              onSearchChange={onSearchChangeVal}
              onClearSearch={() => {
                setSearchTerm("")
                setIsSimpleSearch(false)
              }}
              onSearchSubmit={onSearch}
              onOpenSmartFiltering={() => setShowSmartFilteringDialog(true)}
            />

            {!hasResults ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="text-center space-y-4">
                    <Search className="h-16 w-16 text-gray-300 mx-auto" />
                    <div className="flex flex-col items-center">
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        Ready to Find Companies?
                      </h3>
                      <p className="text-gray-500 max-w-md">
                        Enter keywords in the search box and press Enter for instant results,
                        or use Smart Filtering for advanced weighted scoring.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Search className="h-4 w-4" />
                        <span>Quick search: Enter keywords and press Enter</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Filter className="h-4 w-4" />
                        <span>Advanced: Use Smart Filtering for lead scoring</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Filters and Actions */}
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                  <div className="flex items-center gap-4">
                    {isSimpleSearch && (
                      <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 flex items-center gap-2">
                        <Search className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-800 font-medium">
                          Search: &quot;{searchTerm}&quot;
                        </span>
                        <button
                          onClick={clearFilters}
                          className="text-green-600 hover:text-green-800 text-sm underline ml-2"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                    {hasAppliedFiltering && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 flex items-center gap-2 flex-wrap">
                        <Filter className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-blue-800 font-medium">
                          Smart Filtering:
                        </span>
                        {smartFiltering.keyword && (
                          <span className="text-xs bg-blue-100 px-2 py-1 rounded">Keyword</span>
                        )}
                        {smartFiltering.industrial && (
                          <span className="text-xs bg-blue-100 px-2 py-1 rounded">Industry</span>
                        )}
                        {smartFiltering.province && (
                          <span className="text-xs bg-blue-100 px-2 py-1 rounded">Province</span>
                        )}
                        {smartFiltering.companySize && (
                          <span className="text-xs bg-blue-100 px-2 py-1 rounded">Size</span>
                        )}
                        {smartFiltering.verificationStatus && (
                          <span className="text-xs bg-blue-100 px-2 py-1 rounded">Status</span>
                        )}
                        <button
                          onClick={clearFilters}
                          className="text-blue-600 hover:text-blue-800 text-sm underline ml-2"
                        >
                          Clear All
                        </button>
                      </div>
                    )}
                    {hasApiError && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 flex items-center gap-2">
                        <span className="text-sm text-yellow-800">
                          Using fallback data (API unavailable)
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowCreateDialog(true)}
                      className="px-3 py-2 bg-green-600 text-sm text-white rounded-md hover:bg-green-700 flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Create Company
                    </button>
                    <button
                      onClick={onAddToList}
                      disabled={selectedCompanies.length === 0 || isLoading}
                      className="px-3 py-2 bg-primary text-sm text-primary-foreground rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90"
                    >
                      Add to List ({selectedCompanies.length})
                    </button>
                    <button
                      onClick={() => setShowExportModal(true)}
                      disabled={selectedCompanies.length === 0}
                      className="px-3 py-2 border text-sm border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Export ({selectedCompanies.length})
                    </button>
                    <button
                      onClick={() => setShowImportModal(true)}
                      className="px-3 py-2 border text-sm border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Import
                    </button>
                  </div>
                </div>

                {/* Results Table */}
                <CompanyTable
                    companies={filteredCompanies}
                    selectedCompanies={selectedCompanies}
                    onSelectCompany={handleSelectCompany}
                    onSelectAll={handleSelectAll}
                    onViewCompany={ViewCompany}
                    showLeadScores={hasAppliedFiltering}
                    leadScores={leadScores}
                    sortable={true}
                />

                {!isLoading && (
                  <div className="text-sm text-gray-600 flex justify-between">
                    <span>Showing {filteredCompanies.length} companies matching &quot;{searchTerm}&quot;</span>
                    {filteredCompanies.length > 0 && (
                      <span className="text-blue-600">
                        Sorted by: Highest weighted score first
                      </span>
                    )}
                  </div>
                )}

              </>
            )}
          </TabsContent>

          <TabsContent value="lists">
            <div className="text-center py-12">
              <p className="text-gray-500">My Lists functionality will be available in the List Management section.</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Add to List Dialog - Updated to refresh data */}
        <AddToListDialog
          open={showAddToListDialog}
          onOpenChange={setShowAddToListDialog}
          selectedCompanyIds={selectedCompanies}
          onSuccess={() => {
            setSelectedCompanies([])
            setShowAddToListDialog(false)
          }}
        />

        {/* Create Company Dialog */}
        <CompanyCreateDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSuccess={handleCreateSuccess}
        />

        {/* Smart Filtering Dialog */}
        <SmartFilteringPanel
          isOpen={showSmartFilteringDialog}
          onOpenChange={setShowSmartFilteringDialog}
          criteria={smartFiltering}
          onApplyFiltering={handleApplySmartFiltering}
          onClearFiltering={clearFilters}
          initialKeyword={searchTerm}
        />

        {/* Export fields modal */}
        {showExportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black opacity-40" onClick={() => setShowExportModal(false)} />
            <div className="bg-white rounded-lg shadow-lg z-10 w-full max-w-2xl p-6">
              <h3 className="text-lg font-semibold mb-2">เลือกคอลัมน์ที่ต้องการส่งออก</h3>
              <p className="text-sm text-gray-600 mb-4">เลือกคอลัมน์ที่จะรวมในไฟล์ Excel. การเลือกเริ่มต้นเป็นทั้งหมด.</p>
              <div className="flex items-center justify-between mb-3">
                <button type="button" className="px-3 py-1 border rounded" onClick={() => {
                  if (selectedExportKeys.length === exportFieldDefs.length) {
                    setSelectedExportKeys([])
                  } else {
                    setSelectedExportKeys(exportFieldDefs.map((f: any) => f.key))
                  }
                }}>{selectedExportKeys.length === exportFieldDefs.length ? 'Deselect All' : 'Select All'}</button>
                <span className="text-sm text-gray-500">{selectedExportKeys.length} selected</span>
              </div>
              <div className="max-h-64 overflow-auto grid grid-cols-2 gap-2 mb-4">
                {exportFieldDefs.map((f: any) => (
                  <label key={f.key} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={selectedExportKeys.includes(f.key)} onChange={() => {
                      if (selectedExportKeys.includes(f.key)) setSelectedExportKeys(prev => prev.filter(k => k !== f.key))
                      else setSelectedExportKeys(prev => [...prev, f.key])
                    }} />
                    <span>{f.label}</span>
                  </label>
                ))}
              </div>
              <div className="flex justify-end gap-2">
                <button className="px-3 py-2 border rounded" onClick={() => setShowExportModal(false)}>Cancel</button>
                <button className="px-3 py-2 bg-primary text-primary-foreground rounded" onClick={() => { setShowExportModal(false); onExportExcel(selectedExportKeys); }}>Export</button>
              </div>
            </div>
          </div>
        )}

        {/* Import modal */}
        {showImportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black opacity-40" onClick={() => setShowImportModal(false)} />
            <div className="bg-white rounded-lg shadow-lg z-10 w-full max-w-2xl p-6">
              <h3 className="text-lg font-semibold mb-2">Import ข้อมูลจาก Excel (.xlsx/.xls/.csv)</h3>
              <p className="text-sm text-gray-600 mb-4">เลือกไฟล์ Excel เพื่ออัปโหลดและนำเข้าข้อมูลบริษัทเข้าสู่ระบบ</p>

              <div className="mb-4 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer text-gray-600 hover:text-gray-800 text-center"
                >
                  <div className="flex flex-col items-center">
                    <span className="font-medium">Choose File</span>
                    <span className="text-sm text-gray-400">.xlsx / .xls / .csv</span>
                  </div>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  // onChange={handleFileChange}
                  className="hidden"
                />
              </div>


              <div className="flex justify-end gap-2">
                <button className="px-3 py-2 border rounded-md" 
                  onClick={() => setShowImportModal(false)} 
                >
                  Cancel
                </button>
                <button
                  className="px-3 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
                  disabled={!importFile || importUploading}
                  onClick={handleUploadAndValidate}
                >
                  {importUploading ? 'Uploading...' : 'Upload & Validate'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Company Detail Drawer */}
        <CompanyDetailDrawer
          company={selectedCompany}
          open={showCompanyDetail}
          onOpenChange={setShowCompanyDetail}
          onCompanyUpdated={handleCompanyUpdate}
        />

        {/* Loading overlay during refresh */}
        {isLoading && (
          <div className="fixed inset-0 bg-white bg-opacity-20 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Refreshing data...</span>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default requireAuth(["companies:read", "*"])(CompanyLookupPage)
