import React from 'react';
import { useParams } from 'react-router-dom';

export function EditBusinessUser() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Business-User bearbeiten</h1>
      <div className="bg-card rounded-lg p-6">
        <p>Business-User ID: {id}</p>
        {/* Hier wird später der Inhalt hinzugefügt */}
      </div>
    </div>
  );
} 