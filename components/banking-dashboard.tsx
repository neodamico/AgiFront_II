"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LogOut, User, CreditCard, Repeat, DollarSign, UserX, Search, FileSearch, LayoutGridIcon  } from "lucide-react"
import { CustomerRegistration } from "@/components/customer-registration"
import { CustomerSearch } from "@/components/customer-search"
import { AccountOpening } from "@/components/account-opening"
import { AccountSearch } from "@/components/account-search"
import { AutoDebit } from "@/components/auto-debit"
import { BankingTransactions } from "@/components/banking-transactions"
import { AccountClosure } from "@/components/account-closure"
import  Dashboard  from "@/components/dashboard/Dashboard";

type TabType = "home" | "customer" | "search" | "account" | "accountSearch" | "debit" | "transactions" | "dashboard" | "closure"

export function BankingDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("home")

  const handleLogout = () => {
    window.location.reload()
  }

  const tabs = [
    { id: "home", label: "Início", icon: User },
    { id: "customer", label: "Cadastrar Cliente", icon: User },
    { id: "search", label: "Consultar Cliente", icon: Search },
    { id: "account", label: "Abertura de Contas", icon: CreditCard },
    { id: "accountSearch", label: "Consultar Contas", icon: FileSearch },
    { id: "debit", label: "Débito Automático", icon: Repeat },
    { id: "transactions", label: "Transações", icon: DollarSign },
    { id: "dashboard", label: "Dashboard", icon: LayoutGridIcon },
    { id: "closure", label: "Encerramento", icon: UserX },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case "customer":
        return <CustomerRegistration />
      case "search":
        return <CustomerSearch />
      case "account":
        return <AccountOpening />
      case "accountSearch":
        return <AccountSearch />
      case "debit":
        return <AutoDebit />
      case "transactions":
        return <BankingTransactions />
        case "dashboard":
            return <Dashboard />;
      case "closure":
        return <AccountClosure />
      default:
        return (
          <Card className="banking-terminal">
            <CardHeader>
              <CardTitle className="text-primary">Bem-vindo ao SYSAGI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tabs.slice(1).map((tab) => {
                  const Icon = tab.icon
                  return (
                    <Card
                      key={tab.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setActiveTab(tab.id as TabType)}
                    >
                      <CardContent className="p-6 text-center">
                        <Icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                        <h3 className="font-semibold">{tab.label}</h3>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-blue-700">
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">S</span>
              </div>
              <h1 className="text-xl font-bold text-primary">SYSAGI</h1>
            </div>
            <Button variant="outline" onClick={handleLogout} className="flex items-center space-x-2 bg-transparent">
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <nav className="bg-white/90 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`nav-tab flex items-center space-x-2 px-4 py-4 text-sm font-medium whitespace-nowrap ${
                    activeTab === tab.id ? "active" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{renderContent()}</main>
    </div>
  )
}
