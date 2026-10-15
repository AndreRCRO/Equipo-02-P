import 'package:flutter/material.dart';

void main() => runApp(const MaterialApp(home: ConsultaLote()));

class ConsultaLote extends StatefulWidget {
  const ConsultaLote({super.key});

  @override
  State<ConsultaLote> createState() => _ConsultaLoteState();
}

class _ConsultaLoteState extends State<ConsultaLote> {
  String codigo = '';
  String resultado = '';
  final lotes = {
    'L001': 'Productor: Ana Pérez\nCultivo: Papa\nFecha de cosecha: 2026-10-10',
    'L002': 'Productor: Luis Flores\nCultivo: Maíz\nFecha de cosecha: 2026-10-12',
  };

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('Consulta de lote')),
        body: Column(
          children: [
            TextField(
              decoration: const InputDecoration(
                labelText: 'Código de lote',
                helperText: 'Códigos de prueba: L001 y L002',
              ),
              onChanged: (valor) => codigo = valor.trim().toUpperCase(),
            ),
            ElevatedButton(
              onPressed: () => setState(() => resultado =
                  lotes[codigo] ?? 'No existe un lote con ese código.'),
              child: const Text('Consultar'),
            ),
            Text(resultado),
          ],
        ),
      );
}
