
import React, { useState, useRef } from 'react';
import { ArrowLeft, Camera, Mail, Phone, User, FileText, Check, X, MapPin, Plus, Trash2, Star } from 'lucide-react';
import { UserProfile, SavedAddress } from '../types';

interface ProfileEditorProps {
  initialProfile: UserProfile;
  onSave: (profile: UserProfile) => void;
  onCancel: () => void;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ initialProfile, onSave, onCancel }) => {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [previewImage, setPreviewImage] = useState<string>(initialProfile.avatar);
  
  // Address Form State
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newAddress, setNewAddress] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewImage(result);
        setProfile(prev => ({ ...prev, avatar: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddAddress = () => {
      if (!newLabel || !newAddress) return;
      const newAddr: SavedAddress = {
          id: Date.now().toString(),
          label: newLabel,
          address: newAddress,
          isDefault: profile.savedAddresses.length === 0 // Default if first one
      };
      setProfile(prev => ({
          ...prev,
          savedAddresses: [...prev.savedAddresses, newAddr]
      }));
      setNewLabel('');
      setNewAddress('');
      setShowAddAddress(false);
  };

  const handleDeleteAddress = (id: string) => {
      setProfile(prev => ({
          ...prev,
          savedAddresses: prev.savedAddresses.filter(a => a.id !== id)
      }));
  };

  const handleSetDefaultAddress = (id: string) => {
      setProfile(prev => ({
          ...prev,
          savedAddresses: prev.savedAddresses.map(a => ({
              ...a,
              isDefault: a.id === id
          }))
      }));
  };

  const handleUseCurrentLocation = () => {
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((pos) => {
              // Mock reverse geocoding
              setNewAddress(`Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)}`);
          }, () => {
              alert('Could not fetch location');
          });
      }
  };

  const handleSave = () => {
    onSave(profile);
  };

  return (
    <div className="min-h-screen bg-white pb-24 relative z-50 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <button onClick={onCancel} className="p-1.5 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={20} className="text-gray-900" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Edit Profile</h1>
        <div className="w-8"></div> {/* Spacer for alignment */}
      </div>

      <div className="p-5 max-w-lg mx-auto">
        {/* Avatar Uploader */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-24 h-24 rounded-full border-4 border-gray-100 overflow-hidden shadow-sm group-hover:border-brand-orange transition-colors">
              <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-0 right-0 bg-brand-dark text-white p-1.5 rounded-full border-2 border-white shadow-md group-hover:bg-brand-orange transition-colors">
              <Camera size={16} />
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
          <p className="mt-2 text-[10px] font-bold text-brand-orange uppercase tracking-wide">Change Photo</p>
        </div>

        {/* Personal Info */}
        <div className="space-y-4 mb-8">
          <h3 className="font-bold text-xs text-gray-900 border-b border-gray-100 pb-2">Personal Information</h3>
          
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                value={profile.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange text-gray-900 font-medium"
                placeholder="Your Name"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="email" 
                value={profile.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange text-gray-900 font-medium"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">Phone Number</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="tel" 
                value={profile.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange text-gray-900 font-medium"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">Bio</label>
            <div className="relative">
              <FileText size={16} className="absolute left-3 top-3 text-gray-400" />
              <textarea 
                value={profile.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                rows={2}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange text-gray-900 font-medium resize-none"
                placeholder="Tell us a bit about yourself..."
              />
            </div>
          </div>
        </div>

        {/* Delivery Addresses */}
        <div className="space-y-4 mb-24">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <h3 className="font-bold text-xs text-gray-900">Delivery Addresses</h3>
                <button 
                    onClick={() => setShowAddAddress(!showAddAddress)}
                    className="text-[10px] font-bold text-brand-orange flex items-center hover:bg-orange-50 px-2 py-1 rounded"
                >
                    <Plus size={12} className="mr-1"/> Add New
                </button>
            </div>

            {/* Add Address Form */}
            {showAddAddress && (
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 animate-in slide-in-from-top-2">
                    <div className="mb-2">
                        <input 
                            type="text" 
                            placeholder="Label (e.g. Home, Work)" 
                            value={newLabel}
                            onChange={(e) => setNewLabel(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs mb-2"
                        />
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                placeholder="Address" 
                                value={newAddress}
                                onChange={(e) => setNewAddress(e.target.value)}
                                className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs"
                            />
                            <button 
                                onClick={handleUseCurrentLocation}
                                className="bg-brand-dark text-white p-2 rounded-lg"
                                title="Use Current Location"
                            >
                                <MapPin size={14}/>
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setShowAddAddress(false)} className="text-xs font-bold text-gray-500 px-3 py-1.5">Cancel</button>
                        <button onClick={handleAddAddress} className="bg-brand-orange text-white text-xs font-bold px-3 py-1.5 rounded-lg">Add Address</button>
                    </div>
                </div>
            )}

            {/* Address List */}
            <div className="space-y-2">
                {profile.savedAddresses.length === 0 && !showAddAddress && (
                    <p className="text-center text-xs text-gray-400 py-2">No saved addresses.</p>
                )}
                {profile.savedAddresses.map(addr => (
                    <div key={addr.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className={`p-2 rounded-full ${addr.isDefault ? 'bg-orange-50 text-brand-orange' : 'bg-gray-100 text-gray-400'}`}>
                                <MapPin size={16} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-gray-900 flex items-center">
                                    {addr.label}
                                    {addr.isDefault && <span className="ml-2 text-[9px] bg-gray-100 text-gray-500 px-1.5 rounded">Default</span>}
                                </p>
                                <p className="text-[10px] text-gray-500 truncate">{addr.address}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            {!addr.isDefault && (
                                <button 
                                    onClick={() => handleSetDefaultAddress(addr.id)}
                                    className="p-1.5 text-gray-400 hover:text-brand-orange"
                                    title="Set as Default"
                                >
                                    <Star size={14}/>
                                </button>
                            )}
                            <button 
                                onClick={() => handleDeleteAddress(addr.id)}
                                className="p-1.5 text-gray-400 hover:text-red-500"
                            >
                                <Trash2 size={14}/>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 pb-8 z-20">
        <div className="max-w-lg mx-auto flex gap-3">
            <button 
                onClick={onCancel}
                className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors text-sm"
            >
                Cancel
            </button>
            <button 
                onClick={handleSave}
                className="flex-[2] py-3 rounded-xl font-bold text-white bg-brand-dark hover:bg-gray-800 transition-colors flex items-center justify-center shadow-lg text-sm"
            >
                <Check size={16} className="mr-2" /> Save Changes
            </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditor;
