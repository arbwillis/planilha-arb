'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Gift } from 'lucide-react';
import { useState } from 'react';
import { RegistrarLucroModal } from './modals/registrar-lucro-modal';
import { RegistrarPrejuizoModal } from './modals/registrar-prejuizo-modal';
import { RegistrarFreebetModal } from './modals/registrar-freebet-modal';

export function RegisterCard() {
  const [modalLucroAberto, setModalLucroAberto] = useState(false);
  const [modalPrejuizoAberto, setModalPrejuizoAberto] = useState(false);
  const [modalFreebetAberto, setModalFreebetAberto] = useState(false);

  return (
    <>
      <Card className="w-full h-full flex flex-col">
        <CardHeader className="pb-6">
          <CardTitle className="text-xl font-bold text-center">
            Registrar Operação
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 flex-1 flex flex-col justify-center">
          <div className="grid grid-cols-1 gap-4">
            {/* Botão Registrar Lucro */}
            <Button
              onClick={() => setModalLucroAberto(true)}
              className="h-14 flex items-center justify-start gap-4 bg-green-600 hover:bg-green-700 text-white px-6 rounded-lg"
            >
              <TrendingUp size={20} />
              <span className="font-semibold">Registrar Lucro</span>
            </Button>

            {/* Botão Registrar Prejuízo */}
            <Button
              onClick={() => setModalPrejuizoAberto(true)}
              className="h-14 flex items-center justify-start gap-4 bg-red-600 hover:bg-red-700 text-white px-6 rounded-lg"
            >
              <TrendingDown size={20} />
              <span className="font-semibold">Registrar Prejuízo</span>
            </Button>

            {/* Botão Registrar Freebet */}
            <Button
              onClick={() => setModalFreebetAberto(true)}
              className="h-14 flex items-center justify-start gap-4 px-6 rounded-lg"
              style={{ 
                backgroundColor: 'oklch(0.6 0.25 240)', 
                color: 'white' 
              }}
            >
              <Gift size={20} />
              <span className="font-semibold">Registrar Freebet</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modais */}
      <RegistrarLucroModal 
        aberto={modalLucroAberto} 
        onClose={() => setModalLucroAberto(false)} 
      />
      <RegistrarPrejuizoModal 
        aberto={modalPrejuizoAberto} 
        onClose={() => setModalPrejuizoAberto(false)} 
      />
      <RegistrarFreebetModal 
        aberto={modalFreebetAberto} 
        onClose={() => setModalFreebetAberto(false)} 
      />
    </>
  );
}