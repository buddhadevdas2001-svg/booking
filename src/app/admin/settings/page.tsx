'use client'

import { useState } from 'react'
import { Save, Settings, Bell, Shield, CreditCard, Mail, Phone, Globe } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState({
        // General Settings
        companyName: 'Shamolly Bus Agency',
        companyEmail: 'admin@shamolly.com',
        companyPhone: '+91-9876543210',
        timezone: 'Asia/Kolkata',
        currency: 'INR',

        // Booking Settings
        maxAdvanceBookingDays: 90,
        minAdvanceBookingHours: 2,
        seatLockDurationMinutes: 5,
        allowGuestBookings: true,
        requirePhoneVerification: true,

        // Payment Settings
        stripeEnabled: true,
        paypalEnabled: false,
        razorpayEnabled: false,
        paymentGatewayFee: 2.5,

        // Notification Settings
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: false,
        bookingConfirmationEmail: true,
        paymentReminderSMS: true,

        // Security Settings
        twoFactorAuth: false,
        sessionTimeoutMinutes: 60,
        passwordMinLength: 8,
        requireSpecialCharacters: true,

        // API Settings
        apiRateLimit: 100,
        apiKeyExpirationDays: 365,
        webhookRetries: 3,
    })

    const [activeTab, setActiveTab] = useState('general')

    const handleSave = async () => {
        try {
            // Here you would save to database
            toast.success('Settings saved successfully!')
        } catch (error) {
            toast.error('Failed to save settings')
        }
    }

    const updateSetting = (key: string, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }))
    }

    const tabs = [
        { id: 'general', label: 'General', icon: Settings },
        { id: 'booking', label: 'Booking', icon: Globe },
        { id: 'payment', label: 'Payment', icon: CreditCard },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield },
    ]

    return (
        <div className="space-y-6">
            <div className="page-header">
                <div>
                    <h1 className="section-title">System Settings</h1>
                    <p className="text-slate-400 mt-1">Configure system preferences and operational parameters</p>
                </div>
                <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                    <Save size={18} />
                    Save Changes
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="card">
                        <nav className="space-y-1">
                            {tabs.map((tab) => {
                                const Icon = tab.icon
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                                            activeTab === tab.id
                                                ? 'bg-blue-500/20 text-blue-400'
                                                : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
                                        }`}
                                    >
                                        <Icon size={18} />
                                        {tab.label}
                                    </button>
                                )
                            })}
                        </nav>
                    </div>
                </div>

                {/* Content */}
                <div className="lg:col-span-3">
                    <div className="card">
                        {/* General Settings */}
                        {activeTab === 'general' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-medium mb-4">General Settings</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Company Name
                                        </label>
                                        <input
                                            type="text"
                                            value={settings.companyName}
                                            onChange={(e) => updateSetting('companyName', e.target.value)}
                                            className="input-field"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Company Email
                                        </label>
                                        <input
                                            type="email"
                                            value={settings.companyEmail}
                                            onChange={(e) => updateSetting('companyEmail', e.target.value)}
                                            className="input-field"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Company Phone
                                        </label>
                                        <input
                                            type="tel"
                                            value={settings.companyPhone}
                                            onChange={(e) => updateSetting('companyPhone', e.target.value)}
                                            className="input-field"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Timezone
                                        </label>
                                        <select
                                            value={settings.timezone}
                                            onChange={(e) => updateSetting('timezone', e.target.value)}
                                            className="input-field"
                                        >
                                            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                                            <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                                            <option value="UTC">UTC</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Currency
                                        </label>
                                        <select
                                            value={settings.currency}
                                            onChange={(e) => updateSetting('currency', e.target.value)}
                                            className="input-field"
                                        >
                                            <option value="INR">Indian Rupee (INR)</option>
                                            <option value="USD">US Dollar (USD)</option>
                                            <option value="EUR">Euro (EUR)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Booking Settings */}
                        {activeTab === 'booking' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-medium mb-4">Booking Settings</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Max Advance Booking (Days)
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.maxAdvanceBookingDays}
                                            onChange={(e) => updateSetting('maxAdvanceBookingDays', parseInt(e.target.value))}
                                            className="input-field"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Min Advance Booking (Hours)
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.minAdvanceBookingHours}
                                            onChange={(e) => updateSetting('minAdvanceBookingHours', parseInt(e.target.value))}
                                            className="input-field"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Seat Lock Duration (Minutes)
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.seatLockDurationMinutes}
                                            onChange={(e) => updateSetting('seatLockDurationMinutes', parseInt(e.target.value))}
                                            className="input-field"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="text-sm font-medium text-slate-300">Allow Guest Bookings</label>
                                            <p className="text-xs text-slate-400">Allow bookings without user registration</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.allowGuestBookings}
                                                onChange={(e) => updateSetting('allowGuestBookings', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="text-sm font-medium text-slate-300">Require Phone Verification</label>
                                            <p className="text-xs text-slate-400">Require SMS verification for bookings</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.requirePhoneVerification}
                                                onChange={(e) => updateSetting('requirePhoneVerification', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Payment Settings */}
                        {activeTab === 'payment' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-medium mb-4">Payment Settings</h3>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="text-sm font-medium text-slate-300">Stripe Payment Gateway</label>
                                            <p className="text-xs text-slate-400">Enable Stripe for payment processing</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.stripeEnabled}
                                                onChange={(e) => updateSetting('stripeEnabled', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="text-sm font-medium text-slate-300">PayPal Payment Gateway</label>
                                            <p className="text-xs text-slate-400">Enable PayPal for payment processing</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.paypalEnabled}
                                                onChange={(e) => updateSetting('paypalEnabled', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Payment Gateway Fee (%)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={settings.paymentGatewayFee}
                                            onChange={(e) => updateSetting('paymentGatewayFee', parseFloat(e.target.value))}
                                            className="input-field"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notification Settings */}
                        {activeTab === 'notifications' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-medium mb-4">Notification Settings</h3>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="text-sm font-medium text-slate-300">Email Notifications</label>
                                            <p className="text-xs text-slate-400">Send email notifications for bookings</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.emailNotifications}
                                                onChange={(e) => updateSetting('emailNotifications', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="text-sm font-medium text-slate-300">SMS Notifications</label>
                                            <p className="text-xs text-slate-400">Send SMS notifications for bookings</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.smsNotifications}
                                                onChange={(e) => updateSetting('smsNotifications', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="text-sm font-medium text-slate-300">Booking Confirmation Email</label>
                                            <p className="text-xs text-slate-400">Send confirmation emails after successful booking</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.bookingConfirmationEmail}
                                                onChange={(e) => updateSetting('bookingConfirmationEmail', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="text-sm font-medium text-slate-300">Payment Reminder SMS</label>
                                            <p className="text-xs text-slate-400">Send SMS reminders for pending payments</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.paymentReminderSMS}
                                                onChange={(e) => updateSetting('paymentReminderSMS', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Security Settings */}
                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-medium mb-4">Security Settings</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Session Timeout (Minutes)
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.sessionTimeoutMinutes}
                                            onChange={(e) => updateSetting('sessionTimeoutMinutes', parseInt(e.target.value))}
                                            className="input-field"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Password Minimum Length
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.passwordMinLength}
                                            onChange={(e) => updateSetting('passwordMinLength', parseInt(e.target.value))}
                                            className="input-field"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            API Rate Limit (requests/minute)
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.apiRateLimit}
                                            onChange={(e) => updateSetting('apiRateLimit', parseInt(e.target.value))}
                                            className="input-field"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            API Key Expiration (Days)
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.apiKeyExpirationDays}
                                            onChange={(e) => updateSetting('apiKeyExpirationDays', parseInt(e.target.value))}
                                            className="input-field"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="text-sm font-medium text-slate-300">Two-Factor Authentication</label>
                                            <p className="text-xs text-slate-400">Require 2FA for admin accounts</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.twoFactorAuth}
                                                onChange={(e) => updateSetting('twoFactorAuth', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="text-sm font-medium text-slate-300">Require Special Characters</label>
                                            <p className="text-xs text-slate-400">Require special characters in passwords</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.requireSpecialCharacters}
                                                onChange={(e) => updateSetting('requireSpecialCharacters', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}