import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

interface Contact {
  id: number;
  name: string;
  phone: string;
}

interface EmergencyContactsProps {
  onClose: () => void;
}

const EmergencyContacts: React.FC<EmergencyContactsProps> = ({ onClose }) => {
  const [contacts, setContacts] = useState<Contact[]>([
    { id: 1, name: 'John Doe', phone: '+1 234-567-8900' }
  ]);
  const [newContact, setNewContact] = useState({ name: '', phone: '' });

  const addContact = () => {
    if (newContact.name && newContact.phone) {
      setContacts([...contacts, { ...newContact, id: Date.now() }]);
      setNewContact({ name: '', phone: '' });
    }
  };

  const removeContact = (id: number) => {
    setContacts(contacts.filter(contact => contact.id !== id));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Emergency Contacts</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          {contacts.map(contact => (
            <div key={contact.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <div>
                <p className="font-medium">{contact.name}</p>
                <p className="text-gray-500 text-sm">{contact.phone}</p>
              </div>
              <button
                onClick={() => removeContact(contact.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-full"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Contact Name"
            value={newContact.name}
            onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
            className="w-full p-2 border rounded-lg"
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={newContact.phone}
            onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
            className="w-full p-2 border rounded-lg"
          />
          <button
            onClick={addContact}
            className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 flex items-center justify-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Contact
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyContacts;