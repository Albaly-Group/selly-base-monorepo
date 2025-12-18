"use client";

import { useState, useMemo, useCallback, ChangeEvent, useRef } from "react";
import { Navigation } from "@/components/navigation";
import { CompanySearch } from "@/components/company-search";
import { useTranslations } from 'next-intl'
import { CompanyTable } from "@/components/company-table";
import { AddToListDialog } from "@/components/add-to-list-dialog";
import { CompanyDetailDrawer } from "@/components/company-detail-drawer";
import { CompanyCreateDialog } from "@/components/company-create-dialog";
import {
  SmartFilteringPanel,
  type SmartFilteringCriteria,
} from "@/components/smart-filtering-panel";
import { requireAuth } from "@/lib/auth";
import { useCompaniesSearch } from "@/lib/hooks/api-hooks";
import {
  type WeightedLeadScore,
  calculateWeightedLeadScore,
} from "@/lib/types";
import type { Company } from "@/lib/types";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, Loader2, Plus } from "lucide-react";
import ExcelJS from "exceljs";
import Papa from "papaparse";
import { apiClient } from "@/lib/api-client";

function CompanyLookupPage() {
  const t = useTranslations('companies_lookup');
  const tSearch = useTranslations('companies_lookup.search');
  const tFilters = useTranslations('companies_lookup.filters');
  const tActions = useTranslations('companies_lookup.actions');
  const tEmpty = useTranslations('companies_lookup.emptyState');
  const tExport = useTranslations('companies_lookup.export');
  const tImport = useTranslations('companies_lookup.import');
  const [searchTerm, setSearchTerm] = useState("");
  const [smartFiltering, setSmartFiltering] = useState<SmartFilteringCriteria>(
    {}
  );
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [showAddToListDialog, setShowAddToListDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSmartFilteringDialog, setShowSmartFilteringDialog] =
    useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showCompanyDetail, setShowCompanyDetail] = useState(false);
  const [hasAppliedFiltering, setHasAppliedFiltering] = useState(false);
  const [isSimpleSearch, setIsSimpleSearch] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Export modal / selected fields
  const exportFieldDefs = useMemo(
    () => [
      {
        key: "name_en",
        label: "Company Name",
        get: (c: any) => c.companyNameEn || "",
      },
      {
        key: "name_th",
        label: "Name (TH)",
        get: (c: any) => c.companyNameTh || "",
      },
      {
        key: "name_local",
        label: "Local Name",
        get: (c: any) => c.companyNameLocal || "",
      },
      {
        key: "primary_registration_no",
        label: "Registration No",
        get: (c: any) => {
          // Get primary registration from companyRegistrations array
          const registrations = Array.isArray(c.companyRegistrations)
            ? c.companyRegistrations
            : [];
          const primaryReg = registrations.find((r: any) => r.isPrimary);
          return primaryReg?.registrationNo || registrations[0]?.registrationNo || "";
        },
      },
      {
        key: "registration_country_code",
        label: "Registration Country",
        get: (c: any) => c.registrationCountryCode || "",
      },
      {
        key: "duns_number",
        label: "DUNS Number",
        get: (c: any) => c.dunsNumber || "",
      },
      {
        key: "address_line_1",
        label: "Address Line 1",
        get: (c: any) => c.addressLine1 || c.address1 || "",
      },
      {
        key: "address_line_2",
        label: "Address Line 2",
        get: (c: any) => c.addressLine2 || c.address2 || "",
      },
      {
        key: "postal_code",
        label: "Postal Code",
        get: (c: any) => c.postalCode || "",
      },
      {
        key: "business_description",
        label: "Business Description",
        get: (c: any) => c.businessDescription || c.description || "",
        wrapText: true,
      },
      {
        key: "established_date",
        label: "Established Date",
        get: (c: any) => c.establishedDate || c.registrationDate || null,
        type: "date",
      },
      {
        key: "employee_count_estimate",
        label: "Employee Count Estimate",
        get: (c: any) => c.employeeCountEstimate || null,
        type: "number",
      },
      {
        key: "company_size",
        label: "Company Size",
        get: (c: any) => c.companySize || "",
      },
      {
        key: "annual_revenue_estimate",
        label: "Annual Revenue Estimate",
        get: (c: any) => c.annualRevenueEstimate || null,
        type: "number",
      },
      {
        key: "currency_code",
        label: "Currency Code",
        get: (c: any) => c.currencyCode || "",
      },
      {
        key: "website_url",
        label: "Website",
        get: (c: any) => c.websiteUrl || "",
      },
      {
        key: "linkedin_url",
        label: "LinkedIn URL",
        get: (c: any) => c.linkedinUrl || "",
      },
      {
        key: "facebook_url",
        label: "Facebook URL",
        get: (c: any) => c.facebookUrl || "",
      },
      {
        key: "primary_email",
        label: "Primary Email",
        get: (c: any) => c.primaryEmail || "",
      },
      {
        key: "primary_phone",
        label: "Primary Phone",
        get: (c: any) => c.primaryPhone || "",
      },
      { key: "logo_url", label: "Logo URL", get: (c: any) => c.logoUrl || "" },
      {
        key: "primary_industry",
        label: "Primary Industry",
        get: (c: any) => c.primaryIndustryDisplay || c.primaryIndustryId || "",
      },
      {
        key: "primary_region",
        label: "Primary Region",
        get: (c: any) => c.primaryRegionDisplay || c.primaryRegionId || "",
      },
      {
        key: "contact_phones",
        label: "Contact Phones",
        get: (c: any) => {
          const contacts = Array.isArray(c.contactPersons)
            ? c.contactPersons
            : [];
          const phones = contacts
            .map((p: any, idx: number) =>
              p && p.phone ? `${p.phone} (contact${idx + 1})` : null
            )
            .filter(Boolean as any);
          return phones.length > 0 ? phones.join(", ") : "";
        },
      },
      {
        key: "contact_emails",
        label: "Contact Emails",
        get: (c: any) => {
          const contacts = Array.isArray(c.contactPersons)
            ? c.contactPersons
            : [];
          const emails = contacts
            .map((p: any, idx: number) =>
              p && p.email ? `${p.email} (contact${idx + 1})` : null
            )
            .filter(Boolean as any);
          if (emails.length > 0) {
            return `${emails.join(", ")}`;
          }
          if (c.primaryEmail) {
            return `${c.primaryEmail} (primary)`;
          }
          return "";
        },
      },
      {
        key: "data_quality_score",
        label: "Data Quality Score",
        get: (c: any) =>
          typeof c.dataQualityScore === "number"
            ? c.dataQualityScore
            : c.dataQualityScore
              ? parseFloat(c.dataQualityScore)
              : null,
        type: "number",
      },
      {
        key: "data_sensitivity",
        label: "Data Sensitivity",
        get: (c: any) => c.dataSensitivity || "",
      },
      {
        key: "verification_status",
        label: "Verification Status",
        get: (c: any) => c.verificationStatus || "",
      },
      {
        key: "last_enriched_at",
        label: "Last Enriched At",
        get: (c: any) =>
          c.lastEnrichedAt ? c.lastEnrichedAt : c.lastUpdated || null,
        type: "date",
      },
    ],
    []
  );

  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const [importFile, setImportFile] = useState<File | null>(null);
  const [importUploading, setImportUploading] = useState(false);
  const [parsedImportRows, setParsedImportRows] = useState<any[]>([]);
  const [importPreviewCols, setImportPreviewCols] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const closeImportModal = () => {
    setShowImportModal(false);
    setImportFile(null);
    setParsedImportRows([]);
    setImportPreviewCols([]);
    setImportUploading(false);
    try {
      if (fileInputRef && fileInputRef.current) fileInputRef.current.value = "";
    } catch (e) {
      // ignore
    }
  };

  const [selectedExportKeys, setSelectedExportKeys] = useState<string[]>(() =>
    exportFieldDefs.map((f: any) => f.key)
  );

  const apiSearchFilters = useMemo(() => {
    const filters: any = {
      page: currentPage,
      limit: 25,
      _refresh: refreshTrigger,
    };

    if (isSimpleSearch) {
      if (searchTerm.trim()) {
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
      if (smartFiltering.industrial) {
        console.log("Smart", smartFiltering.industrial);
        filters.industrial = smartFiltering.industrial;
      }
      if (smartFiltering.province) {
        filters.province = smartFiltering.province;
      }
      if (smartFiltering.companySize) {
        filters.companySize = smartFiltering.companySize;
      }
      if (smartFiltering.verificationStatus) {
        filters.verificationStatus = smartFiltering.verificationStatus;
      }
    }

    return filters;
  }, [
    searchTerm,
    smartFiltering,
    hasAppliedFiltering,
    isSimpleSearch,
    currentPage,
    refreshTrigger,
  ]);

  const shouldSearch =
    (isSimpleSearch && searchTerm.trim()) || hasAppliedFiltering;
  const {
    data: apiSearchResult,
    isLoading: isApiLoading,
    isError: hasApiError,
  } = useCompaniesSearch(shouldSearch ? apiSearchFilters : {});

  const { filteredCompanies, leadScores, isLoading, paginationInfo } = useMemo(() => {
    if (shouldSearch && isApiLoading) {
      return { filteredCompanies: [], leadScores: {}, isLoading: true, paginationInfo: null };
    }

    if (shouldSearch && apiSearchResult && !hasApiError) {
      const companies = apiSearchResult.items.map((item: any) => {
        // Handle industry_classification which can be JSONB array or object
        let industrialName = "N/A";
        if (item.industryClassification) {
          if (Array.isArray(item.industryClassification)) {
            industrialName = item.industryClassification[0] || "N/A";
          } else if (
            typeof item.industryClassification === "object" &&
            item.industryClassification.name
          ) {
            industrialName = item.industryClassification.name;
          } else if (typeof item.industryClassification === "string") {
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
          industrialName:
            (item.primaryIndustry &&
              (item.primaryIndustry.titleEn ||
                item.primaryIndustry.titleTh ||
                item.primaryIndustry.code)) ||
            industrialName,
          primaryIndustryDisplay:
            (item.primaryIndustry &&
              (item.primaryIndustry.titleEn ||
                item.primaryIndustry.titleTh ||
                item.primaryIndustry.code)) ||
            "N/A",
          primaryRegion: item.primaryRegion || null,
          primaryRegionDisplay:
            (item.primaryRegion &&
              (item.primaryRegion.nameEn ||
                item.primaryRegion.nameTh ||
                item.primaryRegion.code)) ||
            "N/A",
          province:
            (item.primaryRegion &&
              (item.primaryRegion.nameEn ||
                item.primaryRegion.nameTh ||
                item.primaryRegion.code)) ||
            item.province ||
            "N/A",

          // Scoring / privacy
          verificationStatus: item.verificationStatus || "unverified",
          dataQualityScore: parseFloat(item.dataQualityScore) || 0,
          qualityScore: qualityScore,
          dataSensitivity: item.dataSensitivity,
          dataCompleteness: dataCompleteness,

          // Contacts
          contactPersons: (item.companyContacts || []).map((contact: any) => ({
            fullName:
              contact.fullName ||
              `${contact.firstName || ""} ${contact.lastName || ""}`.trim() ||
              "N/A",
            name:
              contact.fullName ||
              `${contact.firstName || ""} ${contact.lastName || ""}`.trim() ||
              "N/A",
            phone: contact.phone,
            email: contact.email,
          })),

          // Registrations
          companyRegistrations: (item.companyRegistrations || []).map((reg: any) => ({
            id: reg.id,
            registrationNo: reg.registrationNo,
            isPrimary: reg.isPrimary,
            status: reg.status,
            authorityId: reg.authorityId,
            registrationTypeId: reg.registrationTypeId,
            countryCode: reg.countryCode,
          })),

          // Timestamps and audit
          lastEnrichedAt: item.lastEnrichedAt,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          lastUpdated: item.updatedAt,
          createdBy: item.createdBy || "system",
        };
      });

      let calculatedLeadScores: { [companyId: string]: WeightedLeadScore } = {};
      if (hasAppliedFiltering && smartFiltering) {
        companies.forEach((company) => {
          const score = calculateWeightedLeadScore(company, smartFiltering);
          calculatedLeadScores[company.id] = score;
        });
      }

      // Calculate pagination info from API response
      const totalPages = Math.ceil(apiSearchResult.total / apiSearchResult.limit);
      const pagination = {
        currentPage: apiSearchResult.page,
        totalPages,
        total: apiSearchResult.total,
        limit: apiSearchResult.limit,
        hasNextPage: apiSearchResult.hasNextPage,
      };

      return {
        filteredCompanies: companies,
        leadScores: calculatedLeadScores,
        isLoading: false,
        paginationInfo: pagination,
      };
    }

    if (hasApiError) {
      console.error("API search failed, no fallback data available");
    }

    return { filteredCompanies: [], leadScores: {}, isLoading: false, paginationInfo: null };
  }, [
    shouldSearch,
    isApiLoading,
    apiSearchResult,
    hasApiError,
    hasAppliedFiltering,
    smartFiltering,
  ]);

  // Function to refresh data
  const refreshData = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
    // Clear selections when refreshing
    setSelectedCompanies([]);
  }, []);

  // Handle page change for server-side pagination
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    setSelectedCompanies([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSelectCompany = (companyId: string, selected: boolean) => {
    if (selected) {
      setSelectedCompanies((prev) => [...prev, companyId]);
    } else {
      setSelectedCompanies((prev) => prev.filter((id) => id !== companyId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedCompanies(filteredCompanies.map((c) => c.id));
    } else {
      setSelectedCompanies([]);
    }
  };

  const onAddToList = () => {
    if (selectedCompanies.length > 0) {
      setShowAddToListDialog(true);
    }
  };

  const onExportExcel = async (fieldKeys?: string[]) => {
    // Use ExcelJS for richer styling and better control
    const selectedData = filteredCompanies.filter((c) =>
      selectedCompanies.includes(c.id)
    );

    // Prefetch registrations for companies that don't have them populated
    const fetchRegs = selectedData.map(async (company) => {
      try {
        const hasRegs = Array.isArray(company.companyRegistrations) && company.companyRegistrations.length > 0;
        if (!hasRegs) {

          const regs = await apiClient.getCompanyRegistrations(company.id).catch(() => []);
          company.companyRegistrations = (Array.isArray(regs) ? regs : []).map((r: any) => ({
            id: r.id,
            registrationNo: r.registrationNo ?? r.registration_no ?? r.registrationNoRaw ?? r.registration_no_raw ?? null,
            isPrimary: r.isPrimary ?? r.is_primary ?? false,
            status: r.status,
            authorityId: r.authorityId ?? r.authority_id,
            registrationTypeId: r.registrationTypeId ?? r.registration_type_id,
            countryCode: r.countryCode ?? r.country_code,
          }));
          // eslint-disable-next-line no-console
          console.debug('export:prefetch:registrations:fetched', { companyId: company.id, companyRegistrations: company.companyRegistrations });
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('export:prefetch:registrations:error', { companyId: company.id, err });
        company.companyRegistrations = [];
      }
    });

    await Promise.all(fetchRegs);

    const chosenKeys =
      fieldKeys && fieldKeys.length > 0 ? fieldKeys : selectedExportKeys;
    if (!chosenKeys || chosenKeys.length === 0) {
      alert("Please select at least one column to export.");
      return;
    }

    const fieldsMap: any = Object.fromEntries(
      exportFieldDefs.map((f: any) => [f.key, f])
    );

    const headers = chosenKeys.map((k) =>
      fieldsMap[k] ? fieldsMap[k].label : k
    );

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Export");

    // Add header row
    ws.addRow(headers);

    // Add data rows dynamically based on selected keys
    selectedData.forEach((company) => {
      const row = chosenKeys.map((key) => {
        const def = fieldsMap[key];
        if (!def) return "";
        const raw = def.get ? def.get(company) : ((company as any)[key] ?? "");
        if (def.type === "date") {
          return raw ? new Date(raw) : null;
        }
        if (def.type === "number") {
          return raw == null || raw === "" ? null : Number(raw);
        }
        return raw == null ? "" : raw;
      });
      ws.addRow(row);
    });

    // Style header
    const headerRow = ws.getRow(1);
    headerRow.font = { bold: true, size: 12, name: "Arial" };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };
    headerRow.height = 20;
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, size: 12, name: "Arial" };
    });

    // Set number/date formats and wrapText where requested
    ws.columns.forEach((col, idx) => {
      const key = chosenKeys[idx];
      const def = fieldsMap[key];
      if (!def) return;
      if (def.type === "number") {
        try {
          ws.getColumn(idx + 1).numFmt = "0.00";
        } catch (e) {}
      }
      if (def.type === "date") {
        try {
          ws.getColumn(idx + 1).numFmt = "mm/dd/yyyy";
        } catch (e) {}
      }
      if (def.wrapText) {
        try {
          ws.getColumn(idx + 1).alignment = { wrapText: true };
        } catch (e) {}
      }
    });

    // Auto column widths (approximate by character length)
    const padding = 2;
    ws.columns.forEach((col) => {
      let max = 10;
      if (col && typeof col.eachCell === "function") {
        col.eachCell({ includeEmpty: true }, (cell) => {
          const raw = cell && (cell as any).value;
          const val =
            raw == null
              ? ""
              : typeof raw === "object" && (raw as any).text
                ? (raw as any).text
                : String(raw);
          max = Math.max(max, val.length);
        });
      }
      if (col) col.width = Math.min(Math.max(max + padding, 10), 120);
    });

    // Freeze header
    ws.views = [{ state: "frozen", ySplit: 1 }];

    // Generate and download
    wb.xlsx
      .writeBuffer()
      .then((buffer) => {
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `selly-base-export-${new Date().toISOString().split("T")[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      })
      .catch((err) => {
        console.error("Failed to generate XLSX", err);
        alert("Unable to generate Excel file");
      });
  };

  const onSearch = () => {
    if (searchTerm.trim()) {
      setIsSimpleSearch(true);
      setHasAppliedFiltering(false);
      setSelectedCompanies([]);
      setCurrentPage(1); // Reset to first page on new search
    }
  };

  const onSearchChangeVal = (text: string) => {
    setSearchTerm(text);
    if (!text.trim()) {
      setIsSimpleSearch(false);
    }
  };

  const handleApplySmartFiltering = (criteria: SmartFilteringCriteria) => {
    setSmartFiltering(criteria);
    setHasAppliedFiltering(true);
    setIsSimpleSearch(false);
    setSelectedCompanies([]);
    setCurrentPage(1); // Reset to first page on new filter
  };

  const clearFilters = () => {
    setSmartFiltering({});
    setHasAppliedFiltering(false);
    setIsSimpleSearch(false);
    setSearchTerm("");
    setSelectedCompanies([]);
    setCurrentPage(1); // Reset to first page when clearing filters
  };

  const ViewCompany = (company: any) => {
    console.log("Compay", company);
    setSelectedCompany(company);
    setShowCompanyDetail(true);
  };

  const handleCreateSuccess = (newCompany: Company) => {
    console.log("Company created successfully:", newCompany);
    // Refresh the data to show new company
    refreshData();
  };

  // Handle company edit/update success
  const handleCompanyUpdate = useCallback(
    (updatedCompany: Company) => {
      console.log("Company updated successfully:", updatedCompany);
      // Refresh the data to show updated company
      refreshData();

      // Close any open dialogs
      setShowCompanyDetail(false);
    },
    [refreshData]
  );

  // Handle list operations success
  const handleAddToListSuccess = useCallback(() => {
    setSelectedCompanies([]);
    setShowAddToListDialog(false);
    // Optionally refresh if list operations affect company data
    // refreshData()
  }, []);

  const hasResults = isSimpleSearch || hasAppliedFiltering;

  // Helper to safely extract message from unknown errors
  const getErrorMessage = (err: unknown) => {
    if (!err) return String(err);
    if (err instanceof Error) return err.message;
    if (typeof err === "string") return err;
    try {
      // try to read .message if present on object-like errors
      if (typeof err === "object" && err !== null && "message" in err) {
        return String((err as any).message);
      }
      return JSON.stringify(err);
    } catch {
      return String(err);
    }
  };

  const normalizeHeader = (h: any) => {
    if (h == null) return "";
    return String(h)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  };

  const headerToField: Record<string, string> = {
    // Company table fields
    companynameen: "companyNameEn",
    companynameth: "companyNameTh",
    dunsnumber: "dunsNumber",
    addressline1: "addressLine1",
    addressline2: "addressLine2",
    postalcode: "postalCode",
    businessdescription: "businessDescription",
    establisheddate: "establishedDate",
    employeecountestimate: "employeeCountEstimate",
    websiteurl: "websiteUrl",
    facebookurl: "facebookUrl",
    linkedinurl: "linkedinUrl",
    companyemail: "primaryEmail",
    companyphone: "primaryPhone",
    industry: "primaryIndustryDisplay",
    primaryindustryid: "primaryIndustryId",
    region: "primaryRegionDisplay",
    companysize: "companySize",
    
    // Company registration table fields
    registrationno: "registration_no",
    registrationnumber: "registration_no",
    registrationtype: "registration_type",
    authority: "authority",
    country: "country",
    registereddate: "registered_date",
    
    // Company contact table fields
    firstname: "first_name",
    lastname: "last_name",
    title: "title",
    department: "department",
    contactemail: "contact_email",
    contactphone: "contact_phone",
  };

  const mapRowObjectToCompany = (rowObj: Record<string, any>) => {
    const company: any = {};
    const registration: any = {};
    const contact: any = {};
    
    for (const header in rowObj) {
      const rawVal = rowObj[header];
      if (!rawVal || (typeof rawVal === 'string' && !rawVal.trim())) continue;
      
      const norm = normalizeHeader(header);
      const mapped = headerToField[norm];
      
      if (mapped) {
        // Company registration fields
        if (mapped.startsWith('registration_') || mapped === 'authority' || mapped === 'country' || mapped === 'registered_date') {
          registration[mapped] = rawVal;
        }
        // Company contact fields
        else if (['first_name', 'last_name', 'title', 'department', 'contact_email', 'contact_phone'].includes(mapped)) {
          contact[mapped] = rawVal;
        }
        // Company fields
        else {
          if (mapped === "employeeCountEstimate") {
            const n = Number(rawVal);
            company[mapped] = Number.isFinite(n) ? n : undefined;
          } else {
            company[mapped] = rawVal == null ? "" : String(rawVal).trim();
          }
        }
      } else {
        // try heuristics for common header names
        if (norm.includes("name") && !company.companyNameEn)
          company.companyNameEn = rawVal;
      }
    }

    if (company.primaryIndustryDisplay && !company.industrialName) {
      company.industrialName = company.primaryIndustryDisplay;
    }
    if (company.primaryRegionDisplay && !company.province) {
      company.province = company.primaryRegionDisplay;
    }

    return { company, registration, contact };
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setImportFile(file);
    setParsedImportRows([]);
    setImportPreviewCols([]);

    const name = file.name.toLowerCase();
    try {
      if (name.endsWith(".csv")) {
        // Use PapaParse for robust CSV parsing (handles quotes, commas, newlines inside fields)
        await new Promise<void>((resolve, reject) => {
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (h: any) => (h == null ? "" : String(h)),
            complete: (results: any) => {
              try {
                const data = Array.isArray(results.data) ? results.data : [];
                const headers = (results.meta && results.meta.fields) || (data[0] ? Object.keys(data[0]) : []);
                const rows = data.map((rowObj: any) => mapRowObjectToCompany(rowObj));
                setImportPreviewCols(headers as string[]);
                setParsedImportRows(rows as any[]);
                resolve();
              } catch (err) {
                reject(err);
              }
            },
            error: (err: any) => {
              console.error("CSV parse error", err);
              reject(err);
            },
          });
        });
      } else if (name.endsWith(".xlsx")) {
        const buf = await file.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buf);
        const sheet = workbook.worksheets[0];
        if (!sheet) return;
        const headerRow = sheet.getRow(1);
        const headers: string[] = [];
        headerRow.eachCell((cell, colNumber) => {
          headers.push(
            cell.value == null ? `col${colNumber}` : String(cell.value)
          );
        });
        const rows: any[] = [];
        sheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return;
          const obj: any = {};
          row.eachCell((cell, colNumber) => {
            const h = headers[colNumber - 1] || `col${colNumber}`;
            obj[h] =
              cell.value == null
                ? ""
                : typeof cell.value === "object" &&
                    "text" in (cell.value as any)
                  ? (cell.value as any).text
                  : String(cell.value);
          });
          rows.push(mapRowObjectToCompany(obj));
        });
        setImportPreviewCols(headers);
        setParsedImportRows(rows);
      } else if (name.endsWith(".xls")) {
        alert(".xls file format is not supported in this version. Please convert to .xlsx or .csv and try again.");
      } else {
        // unsupported file type
        alert("Unsupported file type. Please upload .xlsx, .xls or .csv");
      }
    } catch (err) {
      console.error("Failed to parse import file", err);
      alert("Failed to parse file. Check console for details.");
    }
  };

  const handleUpload = async () => {
    if (!importFile) return alert("Please choose a file first");

    setImportUploading(true);

    try {
      // Fetch all reference data needed for mapping
      const [industriesResp, regionsResp, authoritiesResp, registrationTypesResp] = await Promise.all([
        apiClient.getIndustries({ active: true }).catch(() => ({ data: [] })),
        apiClient.getRegionsHierarchical({ active: true, countryCode: "TH" }).catch(() => ({ data: [] })),
        apiClient.getRegistrationAuthorities({ active: true }).catch(() => ({ data: [] })),
        apiClient.getRegistrationTypes().catch(() => ({ data: [] })),
      ]);

      const industries: any[] = (industriesResp && industriesResp.data) || [];
      const regions: any[] = (regionsResp && regionsResp.data) || [];
      const authorities: any[] = (authoritiesResp && authoritiesResp.data) || [];
      const registrationTypes: any[] = (registrationTypesResp && registrationTypesResp.data) || [];

      // Build lookup maps (normalized)
      const normalize = (s: any) => (s ? String(s).toLowerCase().trim() : "");

      const industryMap = new Map<string, string>();
      industries.forEach((ind: any) => {
        const possibleNames = [
          ind.nameEn,
          ind.nameTh,
          ind.name,
          ind.titleEn,
          ind.titleTh,
          ind.code,
        ];
        possibleNames.forEach((val: any) => {
          if (val) industryMap.set(normalize(val), ind.id);
        });
      });

      const regionMap = new Map<string, string>();
      const flattenRegions = (nodes: any[]) => {
        nodes.forEach((r: any) => {
          const possibleNames = [r.nameEn, r.nameTh, r.name, r.code];
          possibleNames.forEach((val: any) => {
            if (val) regionMap.set(normalize(val), r.id);
          });
          if (r.children && r.children.length > 0) flattenRegions(r.children);
        });
      };
      flattenRegions(regions);

      // Build authority map (code -> id)
      const authorityMap = new Map<string, string>();
      authorities.forEach((auth: any) => {
        if (auth.code) authorityMap.set(normalize(auth.code), auth.id);
        if (auth.name) authorityMap.set(normalize(auth.name), auth.id);
      });

      // Build registration type map (key -> id)
      const registrationTypeMap = new Map<string, string>();
      registrationTypes.forEach((type: any) => {
        if (type.key) registrationTypeMap.set(normalize(type.key), type.id);
        if (type.name) registrationTypeMap.set(normalize(type.name), type.id);
      });

      // Map parsed rows
      const unresolvedIndustries = new Set<string>();
      const unresolvedRegions = new Set<string>();

      const processedRows = parsedImportRows.map((row) => {
        const { company, registration, contact } = row;
        
        // Required field
        company.companyNameEn = (company.companyNameEn || "").toString().trim();
        
        // Resolve industry
        if (company.primaryIndustryId) {
          // Already have ID
        } else if (company.primaryIndustryDisplay || company.industrialName) {
          const displayName = company.primaryIndustryDisplay || company.industrialName;
          const id = industryMap.get(normalize(displayName));
          if (id) {
            company.primaryIndustryId = id;
          } else {
            unresolvedIndustries.add(displayName);
          }
        }

        // Resolve region
        if (company.primaryRegionId) {
          // Already have ID
        } else if (company.primaryRegionDisplay || company.province) {
          const displayName = company.primaryRegionDisplay || company.province;
          const id = regionMap.get(normalize(displayName));
          if (id) {
            company.primaryRegionId = id;
          } else {
            unresolvedRegions.add(displayName);
          }
        }

        // Resolve registration authority (code -> id)
        if (registration.authority) {
          const authId = authorityMap.get(normalize(registration.authority));
          if (authId) {
            registration.authorityId = authId;
          }
          delete registration.authority;
        }

        // Resolve registration type (key -> id)
        if (registration.registration_type) {
          const typeId = registrationTypeMap.get(normalize(registration.registration_type));
          if (typeId) {
            registration.registrationTypeId = typeId;
          }
          delete registration.registration_type;
        }

        // Rename registration fields to match DTO
        if (registration.registration_no) {
          registration.registrationNo = registration.registration_no;
          delete registration.registration_no;
        }
        if (registration.country) {
          registration.countryCode = registration.country;
          delete registration.country;
        }
        if (registration.registered_date) {
          registration.registeredDate = registration.registered_date;
          delete registration.registered_date;
        }

        // Rename contact fields to match DTO
        if (contact.first_name) {
          contact.firstName = contact.first_name;
          delete contact.first_name;
        }
        if (contact.last_name) {
          contact.lastName = contact.last_name;
          delete contact.last_name;
        }
        if (contact.contact_email) {
          contact.email = contact.contact_email;
          delete contact.contact_email;
        }
        if (contact.contact_phone) {
          contact.phone = contact.contact_phone;
          delete contact.contact_phone;
        }

        return { company, registration, contact };
      });

      // Filter valid companies
      const validRows = processedRows.filter(
        (row) => row.company.companyNameEn && row.company.companyNameEn.length >= 2
      );
      
      if (validRows.length === 0) {
        alert(
          "No valid rows to upload. Ensure Company Name (EN) exists for at least one row."
        );
        setImportUploading(false);
        return;
      }

      // Create companies first
      const companiesToCreate = validRows.map(row => {
        const { company } = row;
        // Remove display-only fields that are not part of the DTO
        const { primaryIndustryDisplay, primaryRegionDisplay, industrialName, province, ...cleanCompany } = company;
        return cleanCompany;
      });
      const resp = await apiClient.bulkCreateCompanies(companiesToCreate);

      const results = resp && resp.results ? resp.results : [];
      const successfulCompanies = results.filter((r: any) => r.success);
      
      console.log("Bulk import results", results);

      // For each successful company, create registrations and contacts
      const registrationPromises: Promise<any>[] = [];
      const contactPromises: Promise<any>[] = [];

      successfulCompanies.forEach((result: any, index: number) => {
        const companyId = result.id || result.data?.id;
        if (!companyId) return;

        const originalRow = validRows[index];
        const { registration, contact } = originalRow;

        // Create registration if we have registration_no and registration_type
        if (registration.registrationNo && registration.registrationTypeId) {
          registrationPromises.push(
            apiClient.createCompanyRegistration({
              companyId,
              ...registration,
              isPrimary: true,
            }).catch((err) => {
              console.error(`Failed to create registration for company ${companyId}:`, err);
              return { success: false, error: err };
            })
          );
        }

        // Create contact if we have at least first_name or email or phone
        if (contact.firstName || contact.email || contact.phone) {
          contactPromises.push(
            apiClient.createCompanyContact({
              companyId,
              ...contact,
            }).catch((err) => {
              console.error(`Failed to create contact for company ${companyId}:`, err);
              return { success: false, error: err };
            })
          );
        }
      });

      // Wait for all registrations and contacts to be created
      if (registrationPromises.length > 0 || contactPromises.length > 0) {
        await Promise.all([...registrationPromises, ...contactPromises]);
        console.log(
          `Created ${registrationPromises.length} registrations and ${contactPromises.length} contacts`
        );
      }

      if (successfulCompanies.length > 0) {
        alert(
          `Successfully imported ${successfulCompanies.length} companies with related data. ` +
          (unresolvedIndustries.size > 0 ? `\nUnresolved industries: ${Array.from(unresolvedIndustries).join(", ")}` : "") +
          (unresolvedRegions.size > 0 ? `\nUnresolved regions: ${Array.from(unresolvedRegions).join(", ")}` : "")
        );
        refreshData();
        closeImportModal();
      } else {
        alert("No companies were successfully created. Please check your data.");
      }
    } catch (err) {
      console.error("Import failed", err);
      alert(`Import failed: ${getErrorMessage(err)}`);
    } finally {
      setImportUploading(false);
    }
  };

  const downloadImportTemplate = async () => {
    try {
      const res = await fetch("/api/download-template");
      if (!res.ok) throw new Error(`Failed to download template: ${res.status}`);
      
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "selly-base-template.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("downloadImportTemplate error", err);
      alert("Failed to download template. Check console for details.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('title')}
          </h1>
          <p className="text-gray-600">
            {t('subtitle')}
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <h3 className="font-medium mb-2 mt-2">{t('allCompanies')}</h3>

          <TabsContent value="all" className="space-y-4">
            {/* Search Section */}
            <CompanySearch
              searchTerm={searchTerm}
              onSearchChange={onSearchChangeVal}
              onClearSearch={() => {
                setSearchTerm("");
                setIsSimpleSearch(false);
              }}
              onSearchSubmit={onSearch}
              onOpenSmartFiltering={() => setShowSmartFilteringDialog(true)}
            />

            {/* Actions bar - keep Create / Import visible even when no results */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex items-center gap-4">
                {isSimpleSearch && (
                  <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 flex items-center gap-2">
                    <Search className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-800 font-medium">
                      {tSearch('active')} &quot;{searchTerm}&quot;
                    </span>
                    <button
                      onClick={clearFilters}
                      className="text-green-600 hover:text-green-800 text-sm underline ml-2"
                    >
                      {tSearch('clear')}
                    </button>
                  </div>
                )}
                {hasAppliedFiltering && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 flex items-center gap-2 flex-wrap">
                    <Filter className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-800 font-medium">
                      {tFilters('smartFiltering')}
                    </span>
                    {smartFiltering.keyword && (
                      <span className="text-xs bg-blue-100 px-2 py-1 rounded">
                        {tFilters('keyword')}
                      </span>
                    )}
                    {smartFiltering.industrial && (
                      <span className="text-xs bg-blue-100 px-2 py-1 rounded">
                        {tFilters('industry')}
                      </span>
                    )}
                    {smartFiltering.province && (
                      <span className="text-xs bg-blue-100 px-2 py-1 rounded">
                        {tFilters('province')}
                      </span>
                    )}
                    {smartFiltering.companySize && (
                      <span className="text-xs bg-blue-100 px-2 py-1 rounded">
                        {tFilters('size')}
                      </span>
                    )}
                    {smartFiltering.verificationStatus && (
                      <span className="text-xs bg-blue-100 px-2 py-1 rounded">
                        {tFilters('status')}
                      </span>
                    )}
                    <button
                      onClick={clearFilters}
                      className="text-blue-600 hover:text-blue-800 text-sm underline ml-2"
                    >
                      {tSearch('clearAll')}
                    </button>
                  </div>
                )}
                {hasApiError && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 flex items-center gap-2">
                    <span className="text-sm text-yellow-800">
                      {tFilters('usingFallback')}
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
                  {tActions('createCompany')}
                </button>
                <button
                  onClick={() => setShowImportModal(true)}
                  className="px-3 py-2 border text-sm border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {tActions('import')}
                </button>
                <button
                  onClick={() => setShowExportModal(true)}
                  disabled={selectedCompanies.length === 0}
                  className="px-3 py-2 border text-sm border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {tActions('export')} ({selectedCompanies.length})
                </button>
                <button
                  onClick={onAddToList}
                  disabled={selectedCompanies.length === 0 || isLoading}
                  className="px-3 py-2 bg-primary text-sm text-primary-foreground rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90"
                >
                  {tActions('addToList')} ({selectedCompanies.length})
                </button>
              </div>
            </div>

            {!hasResults ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="text-center space-y-4">
                    <Search className="h-16 w-16 text-gray-300 mx-auto" />
                    <div className="flex flex-col items-center">
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        {tEmpty('title')}
                      </h3>
                      <p className="text-gray-500 max-w-md">
                        {tEmpty('description')}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Search className="h-4 w-4" />
                        <span>
                          {tEmpty('quickSearch')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Filter className="h-4 w-4" />
                        <span>
                          {tEmpty('advancedSearch')}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
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
                  pagination={paginationInfo || undefined}
                  onPageChange={handlePageChange}
                />

                {!isLoading && paginationInfo && (
                  <div className="text-sm text-gray-600 flex justify-end">
                    {filteredCompanies.length > 0 && (
                      <span className="text-blue-600">
                        {t('table.sortedBy')}
                      </span>
                    )}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="lists">
            <div className="text-center py-12">
              <p className="text-gray-500">
                My Lists functionality will be available in the List Management
                section.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Add to List Dialog - Updated to refresh data */}
        <AddToListDialog
          open={showAddToListDialog}
          onOpenChange={setShowAddToListDialog}
          selectedCompanyIds={selectedCompanies}
          onSuccess={() => {
            setSelectedCompanies([]);
            setShowAddToListDialog(false);
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
            <div
              className="absolute inset-0 bg-black opacity-40"
              onClick={() => setShowExportModal(false)}
            />
            <div className="bg-white rounded-lg shadow-lg z-10 w-full max-w-2xl p-6">
              <h3 className="text-lg font-semibold mb-2">
                {tExport('title')}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {tExport('description')}
              </p>
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  className="px-3 py-1 border rounded"
                  onClick={() => {
                    if (selectedExportKeys.length === exportFieldDefs.length) {
                      setSelectedExportKeys([]);
                    } else {
                      setSelectedExportKeys(
                        exportFieldDefs.map((f: any) => f.key)
                      );
                    }
                  }}
                >
                  {selectedExportKeys.length === exportFieldDefs.length
                    ? tExport('deselectAll')
                    : tExport('selectAll')}
                </button>
                <span className="text-sm text-gray-500">
                  {selectedExportKeys.length} {tExport('selected')}
                </span>
              </div>
              <div className="max-h-64 overflow-auto grid grid-cols-2 gap-2 mb-4">
                {exportFieldDefs.map((f: any) => (
                  <label
                    key={f.key}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selectedExportKeys.includes(f.key)}
                      onChange={() => {
                        if (selectedExportKeys.includes(f.key))
                          setSelectedExportKeys((prev) =>
                            prev.filter((k) => k !== f.key)
                          );
                        else setSelectedExportKeys((prev) => [...prev, f.key]);
                      }}
                    />
                    <span>{f.label}</span>
                  </label>
                ))}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  className="px-3 py-2 border rounded-md"
                  onClick={() => setShowExportModal(false)}
                >
                  {tExport('cancel')}
                </button>
                <button
                  className="px-3 py-2 bg-primary text-primary-foreground rounded-md"
                  onClick={() => {
                    setShowExportModal(false);
                    onExportExcel(selectedExportKeys);
                  }}
                >
                  {tExport('export')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Import modal */}
        {showImportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black opacity-40"
              onClick={closeImportModal}
            />
            <div className="bg-white rounded-lg shadow-lg z-10 w-full max-w-2xl p-6">
              <h3 className="text-lg font-semibold mb-2">
                {tImport('title')}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {tImport('description')}
                <button
                  type="button"
                  onClick={downloadImportTemplate}
                  className="ml-1 text-blue-600 underline"
                >
                  {tImport('downloadTemplate')}
                </button>
              </p>

              <div className="text-sm text-gray-600 mb-4">

              </div>

              <div className="mb-4 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer text-gray-600 hover:text-gray-800 text-center"
                >
                  <div className="flex flex-col items-center">
                    <span className="font-medium">{tImport('chooseFile')}</span>
                    <span className="text-sm text-gray-400">
                      {tImport('fileTypes')}
                    </span>
                  </div>
                </label>
                <input
                  id="file-upload"
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {importFile && (
                  <div className="mt-3 text-sm text-gray-700">
                    {tImport('selected')} {importFile.name}
                  </div>
                )}
              </div>

              {/* Preview table for parsed rows */}
              {parsedImportRows && parsedImportRows.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">
                    {tImport('preview')} ({parsedImportRows.length})
                  </h4>
                  <div className="overflow-auto max-h-56 border rounded">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-2 py-1 text-left">#</th>
                          <th className="px-2 py-1 text-left">company_nameEn</th>
                          <th className="px-2 py-1 text-left">company_nameTh</th>
                          <th className="px-2 py-1 text-left">duns_number</th>
                          <th className="px-2 py-1 text-left">address_line_1</th>
                          <th className="px-2 py-1 text-left">address_line_2</th>
                          <th className="px-2 py-1 text-left">postal_code</th>
                          <th className="px-2 py-1 text-left">business_description</th>
                          <th className="px-2 py-1 text-left">established_date</th>
                          <th className="px-2 py-1 text-left">employee_count_estimate</th>
                          <th className="px-2 py-1 text-left">website_url</th>
                          <th className="px-2 py-1 text-left">facebook_url</th>
                          <th className="px-2 py-1 text-left">company_email</th>
                          <th className="px-2 py-1 text-left">company_phone</th>
                          <th className="px-2 py-1 text-left">industry</th>
                          <th className="px-2 py-1 text-left">region</th>
                          <th className="px-2 py-1 text-left">registration_no</th>
                          <th className="px-2 py-1 text-left">registration_type</th>
                          <th className="px-2 py-1 text-left">authority</th>
                          <th className="px-2 py-1 text-left">country</th>
                          <th className="px-2 py-1 text-left">registered_date</th>
                          <th className="px-2 py-1 text-left">first_name</th>
                          <th className="px-2 py-1 text-left">last_name</th>
                          <th className="px-2 py-1 text-left">title</th>
                          <th className="px-2 py-1 text-left">department</th>
                          <th className="px-2 py-1 text-left">contact_email</th>
                          <th className="px-2 py-1 text-left">contact_phone</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedImportRows.slice(0, 20).map((r, idx) => (
                          <tr
                            key={idx}
                            className={
                              idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }
                          >
                            <td className="px-2 py-1">{idx + 1}</td>
                            <td className="px-2 py-1">{r.company?.companyNameEn || ""}</td>
                            <td className="px-2 py-1">{r.company?.companyNameTh || ""}</td>
                            <td className="px-2 py-1">{r.company?.dunsNumber || ""}</td>
                            <td className="px-2 py-1">{r.company?.addressLine1 || ""}</td>
                            <td className="px-2 py-1">{r.company?.addressLine2 || ""}</td>
                            <td className="px-2 py-1">{r.company?.postalCode || ""}</td>
                            <td className="px-2 py-1 truncate max-w-xs">{r.company?.businessDescription || ""}</td>
                            <td className="px-2 py-1">{r.company?.establishedDate || ""}</td>
                            <td className="px-2 py-1">{r.company?.employeeCountEstimate ?? ""}</td>
                            <td className="px-2 py-1">{r.company?.websiteUrl || ""}</td>
                            <td className="px-2 py-1">{r.company?.facebookUrl || ""}</td>
                            <td className="px-2 py-1">{r.company?.primaryEmail || ""}</td>
                            <td className="px-2 py-1">{r.company?.primaryPhone || ""}</td>
                            <td className="px-2 py-1">{r.company?.primaryIndustryDisplay || r.company?.industrialName || ""}</td>
                            <td className="px-2 py-1">{r.company?.primaryRegionDisplay || r.company?.province || ""}</td>
                            <td className="px-2 py-1">{r.registration?.registration_no || r.registration?.registrationNo || ""}</td>
                            <td className="px-2 py-1">{r.registration?.registration_type || ""}</td>
                            <td className="px-2 py-1">{r.registration?.authority || ""}</td>
                            <td className="px-2 py-1">{r.registration?.country || r.registration?.countryCode || ""}</td>
                            <td className="px-2 py-1">{r.registration?.registered_date || r.registration?.registeredDate || ""}</td>
                            <td className="px-2 py-1">{r.contact?.first_name || r.contact?.firstName || ""}</td>
                            <td className="px-2 py-1">{r.contact?.last_name || r.contact?.lastName || ""}</td>
                            <td className="px-2 py-1">{r.contact?.title || ""}</td>
                            <td className="px-2 py-1">{r.contact?.department || ""}</td>
                            <td className="px-2 py-1">{r.contact?.contact_email || r.contact?.email || ""}</td>
                            <td className="px-2 py-1">{r.contact?.contact_phone || r.contact?.phone || ""}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {parsedImportRows.length > 20 && (
                    <div className="text-xs text-gray-500 mt-1">
                      {tImport('showingFirst')}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end items-center">
                <div className="flex gap-2">
                  <button
                    className="px-3 py-2 border rounded-md"
                    onClick={closeImportModal}
                  >
                    {tImport('cancel')}
                  </button>
                  <button
                    className="px-3 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
                    disabled={!importFile || importUploading}
                    onClick={handleUpload}
                  >
                    {importUploading ? tImport('uploading') : tImport('upload')}
                  </button>
                </div>
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
              <span>{t('refreshing')}</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default requireAuth(["companies:read", "*"])(CompanyLookupPage);
