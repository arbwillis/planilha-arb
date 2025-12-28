'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Save, StickyNote } from 'lucide-react';

interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotesModal({ isOpen, onClose }: NotesModalProps) {
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Carregar notas do localStorage ao abrir o modal
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      const savedNotes = localStorage.getItem('planilha-arb-notas-v2');
      if (savedNotes) {
        setNotes(savedNotes);
      }
    }
  }, [isOpen]);

  // Salvar notas no localStorage
  const handleSave = () => {
    if (typeof window !== 'undefined') {
      setIsSaving(true);
      localStorage.setItem('planilha-arb-notas-v2', notes);
      
      // Feedback visual de salvamento
      setTimeout(() => {
        setIsSaving(false);
      }, 500);
    }
  };

  // Auto-save quando o usuário para de digitar
  useEffect(() => {
    if (!notes) return;
    
    const timeoutId = setTimeout(() => {
      handleSave();
    }, 1000); // Auto-save após 1 segundo de inatividade

    return () => clearTimeout(timeoutId);
  }, [notes]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <Card className="w-full max-w-xs xs:max-w-sm sm:max-w-md lg:max-w-lg max-h-[85vh] sm:max-h-[75vh] flex flex-col shadow-2xl">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
          <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-1.5 sm:gap-2">
            <StickyNote className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Notas
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 sm:h-7 sm:w-7 p-0 hover:bg-destructive/10"
          >
            <X className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </Button>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col space-y-2 sm:space-y-3 pt-0">
          <Textarea
            placeholder="📝 Suas anotações importantes...

💡 Dicas:
• Metas do mês
• Casas favoritas
• Estratégias
• Lembretes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="flex-1 min-h-[160px] sm:min-h-[180px] lg:min-h-[200px] text-xs sm:text-sm resize-none border-dashed"
          />
          
          <div className="flex flex-col xs:flex-row justify-between items-center gap-2 xs:gap-0 pt-1">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              size="sm"
              className="h-7 sm:h-8 text-xs w-full xs:w-auto"
            >
              <Save className="w-3 h-3 mr-1.5" />
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
            
            <span className="text-xs text-muted-foreground">
              {notes.length > 0 ? `${notes.length} chars` : 'Auto-save'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
