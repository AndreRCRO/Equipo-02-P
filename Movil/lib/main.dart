import 'package:flutter/material.dart';

void main() => runApp(MaterialApp(
      home: Scaffold(
        appBar: AppBar(title: const Text('Consulta de lote')),
        body: Column(
          children: [
            const TextField(
              decoration: InputDecoration(labelText: 'Código de lote'),
            ),
            ElevatedButton(onPressed: () {}, child: const Text('Consultar')),
          ],
        ),
      ),
    ));
