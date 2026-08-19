"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  FileText,
  Calendar,
  User,
  MapPin,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight,
  Filter,
  Search,
  MoreVertical,
} from "lucide-react";

export default function MyCasesPage() {
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const cases = [
    {
      id: 1,
      caseNumber: "2023-CC-1234",
      title: "Property Dispute - Ancestral Land Inheritance",
      description: "Dispute regarding the ownership and inheritance rights of ancestral property in Mumbai",
      status: "Active",
      statusColor: "bg-blue-500/20 text-blue-400",
      nextHearing: "August 25, 2026",
      court: "Delhi High Court",
      judge: "Justice M. K. Sharma",
      lastUpdate: "Document submitted 2 days ago",
      progress: 65,
    },
    {
      id: 2,
      caseNumber: "2024-CC-5678",
      title: "Tenant Rights - Eviction Notice Challenge",
      description: "Response to illegal eviction notice served by landlord in Bangalore",
      status: "Pending Response",
      statusColor: "bg-amber-500/20 text-amber-400",
      nextHearing: "September 10, 2026",
      court: "Karnataka High Court",
      judge: "Justice P. S. Naidu",
      lastUpdate: "Awaiting court response",
      progress: 40,
    },
    {
      id: 3,
      caseNumber: "2023-CC-9012",
      title: "Contract Breach - Construction Project Dispute",
      description: "Claim for damages due to breach of construction contract with XYZ Builders",
      status: "Settled",
      statusColor: "bg-emerald-500/20 text-emerald-400",
      nextHearing: "N/A",
      court: "Mumbai District Court",
      judge: "Justice R. V. Desai",
      lastUpdate: "Case settled - Final order received",
      progress: 100,
    },
    {
      id: 4,
      caseNumber: "2024-CA-3456",
      title: "Consumer Rights - Product Quality Complaint",
      description: "Complaint against manufacturer for defective mobile device",
      status: "In Progress",
      statusColor: "bg-purple-500/20 text-purple-400",
      nextHearing: "August 30, 2026",
      court: "Consumer Court, Delhi",
      judge: "Justice A. K. Mittal",
      lastUpdate: "Evidence submitted successfully",
      progress: 55,
    },
  ];

  const filteredCases = cases.filter((c) => {
    if (filterStatus !== "all" && c.status !== filterStatus) return false;
    if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const statusCounts = {
    all: cases.length,
    Active: cases.filter((c) => c.status === "Active").length,
    "Pending Response": cases.filter((c) => c.status === "Pending Response").length,
    "In Progress": cases.filter((c) => c.status === "In Progress").length,
    Settled: cases.filter((c) => c.status === "Settled").length,
  };

  return (
    <div className="min-h-screen text-[var(--text-primary)] py-12 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold mb-2">My Cases</h1>
          <p className="text-[var(--text-secondary)] mb-8">
            Track and manage all your legal cases in one place
          </p>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search cases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)]/30"
              />
            </div>
            <div className="flex gap-2 items-center">
              <Filter className="w-5 h-5 text-[var(--text-muted)]" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)]/30 text-sm"
              >
                <option value="all">All Cases</option>
                <option value="Active">Active</option>
                <option value="Pending Response">Pending Response</option>
                <option value="In Progress">In Progress</option>
                <option value="Settled">Settled</option>
              </select>
            </div>
          </div>

          {/* Status Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
            {["all", "Active", "Pending Response", "In Progress", "Settled"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`p-3 rounded-lg border transition-all ${
                  filterStatus === status
                    ? "border-[var(--accent-blue)] bg-[var(--accent-blue)]/10"
                    : "border-[var(--border-color)] hover:border-[var(--accent-blue)]"
                }`}
              >
                <div className="text-2xl font-bold">{statusCounts[status as keyof typeof statusCounts]}</div>
                <div className="text-xs text-[var(--text-secondary)] capitalize mt-1">
                  {status === "all" ? "Total" : status}
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Cases List */}
        <div className="space-y-4">
          {filteredCases.map((case_, index) => (
            <motion.div
              key={case_.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 hover:bg-[var(--bg-surface)] transition-colors cursor-pointer">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  {/* Left: Case Details */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-3 bg-[var(--accent-blue)]/10 rounded-lg">
                        <FileText className="w-5 h-5 text-[var(--accent-blue)]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{case_.title}</h3>
                          <Badge className={case_.statusColor}>{case_.status}</Badge>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] mb-3">{case_.description}</p>
                        <div className="text-xs text-[var(--text-muted)]">
                          Case #{case_.caseNumber}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-medium text-[var(--text-secondary)]">
                          Case Progress
                        </span>
                        <span className="text-xs font-semibold text-[var(--accent-blue)]">
                          {case_.progress}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[var(--bg-card)] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${case_.progress}%` }}
                          transition={{ duration: 1 }}
                          className="h-full bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-gold)]"
                        />
                      </div>
                    </div>

                    {/* Case Info Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-[var(--text-muted)] mb-1">Court</p>
                        <p className="font-medium flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {case_.court}
                        </p>
                      </div>
                      <div>
                        <p className="text-[var(--text-muted)] mb-1">Judge</p>
                        <p className="font-medium flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {case_.judge}
                        </p>
                      </div>
                      <div>
                        <p className="text-[var(--text-muted)] mb-1">Next Hearing</p>
                        <p className="font-medium flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {case_.nextHearing}
                        </p>
                      </div>
                      <div>
                        <p className="text-[var(--text-muted)] mb-1">Last Update</p>
                        <p className="font-medium flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {case_.lastUpdate}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                    <Button variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                      View Details
                    </Button>
                    <Button variant="secondary">Documents</Button>
                    <button className="p-2 hover:bg-[var(--bg-card)] rounded-lg transition-colors">
                      <MoreVertical className="w-5 h-5 text-[var(--text-muted)]" />
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}

          {filteredCases.length === 0 && (
            <Card className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No cases found</h3>
              <p className="text-[var(--text-secondary)] mb-6">
                Try adjusting your search or filters
              </p>
              <Button
                variant="primary"
                onClick={() => {
                  setSearchQuery("");
                  setFilterStatus("all");
                }}
              >
                Clear Filters
              </Button>
            </Card>
          )}
        </div>

        {/* New Case CTA */}
        {filteredCases.length > 0 && (
          <div className="mt-12 p-8 bg-gradient-to-r from-[var(--accent-blue)]/10 to-[var(--accent-gold)]/10 rounded-xl border border-[var(--border-color)]">
            <h3 className="text-xl font-semibold mb-3">Need Legal Assistance?</h3>
            <p className="text-[var(--text-secondary)] mb-6">
              Use our AI Legal Assistant to analyze documents, research laws, and get legal insights
            </p>
            <Button variant="primary">Start New Legal Research</Button>
          </div>
        )}
      </div>
    </div>
  );
}
