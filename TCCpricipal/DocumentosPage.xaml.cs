namespace TCCpricipal
{

    public partial class DocumentosPage : ContentPage
    {
        private Entry campoBusca;
        private VerticalStackLayout listaDocumentos;

        public DocumentosPage()
        {
            Title = "Documentos";

            BackgroundColor = Color.FromArgb("#F5F5F5");

            
            // CONTEÚDO PRINCIPAL
            

            ScrollView scroll = new ScrollView();

            VerticalStackLayout conteudo = new VerticalStackLayout
            {
                Padding = new Thickness(25, 25, 25, 40),
                Spacing = 15
            };

            
            // TÍTULO
            

            Label titulo = new Label
            {
                Text = "Organizar Documentos",
                FontSize = 28,
                TextColor = Color.FromArgb("#222222"),
                FontAttributes = FontAttributes.Bold
            };

            Label descricao = new Label
            {
                Text = "Aqui você pode visualizar os documentos que você enviou ou que foram enviados a você",
                FontSize = 14,
                TextColor = Color.FromArgb("#555555")
            };

            conteudo.Children.Add(titulo);
            conteudo.Children.Add(descricao);


            
            // ÁREA BRANCA

            Frame areaDocumentos = new Frame
            {
                BackgroundColor = Colors.White,
                CornerRadius = 12,
                Padding = new Thickness(10),
                HasShadow = true
            };

            VerticalStackLayout areaInterna = new VerticalStackLayout
            {
                Spacing = 12
            };


           
            // ABAS
           

            Grid abas = new Grid
            {
                ColumnDefinitions =
                {
                    new ColumnDefinition { Width = GridLength.Star },
                    new ColumnDefinition { Width = GridLength.Star }
                },
                HeightRequest = 45
            };

            Button abaEnviados = new Button
            {
                Text = "➤ Documentos Enviados",
                FontSize = 14,
                TextColor = Color.FromArgb("#333333"),
                BackgroundColor = Color.FromArgb("#EEEEEE"),
                CornerRadius = 8
            };

            Button abaRecebidos = new Button
            {
                Text = "✓ Atestados Recebidos",
                FontSize = 14,
                TextColor = Color.FromArgb("#555555"),
                BackgroundColor = Color.FromArgb("#DDDDDD"),
                CornerRadius = 8
            };

            abas.Add(abaEnviados, 0);
            abas.Add(abaRecebidos, 1);

            areaInterna.Children.Add(abas);


           
            // CAMPO DE BUSCA
           

            Grid areaBusca = new Grid
            {
                ColumnDefinitions =
                {
                    new ColumnDefinition { Width = GridLength.Star },
                    new ColumnDefinition { Width = 80 }
                },
                ColumnSpacing = 5
            };

            campoBusca = new Entry
            {
                Placeholder = "Faça sua busca",
                FontSize = 14,
                BackgroundColor = Color.FromArgb("#F7F7F7"),
                HeightRequest = 40
            };

            Button botaoBuscar = new Button
            {
                Text = "Buscar",
                FontSize = 13,
                TextColor = Colors.White,
                BackgroundColor = Color.FromArgb("#087A3E"),
                CornerRadius = 4
            };

            botaoBuscar.Clicked += BuscarDocumento;

            areaBusca.Add(campoBusca, 0);
            areaBusca.Add(botaoBuscar, 1);

            areaInterna.Children.Add(areaBusca);


            
            // BOTÃO ENVIAR DOCUMENTO
            

            Button enviarDocumento = new Button
            {
                Text = "+ Enviar Documento",
                FontSize = 14,
                TextColor = Colors.White,
                BackgroundColor = Color.FromArgb("#087A3E"),
                CornerRadius = 6,
                HeightRequest = 45,
                WidthRequest = 180,
                HorizontalOptions = LayoutOptions.Center
            };

            enviarDocumento.Clicked += EnviarDocumento;

            areaInterna.Children.Add(enviarDocumento);


           
            // LISTA DE DOCUMENTOS
           

            listaDocumentos = new VerticalStackLayout
            {
                Spacing = 10,
                Margin = new Thickness(0, 5, 0, 0)
            };

            listaDocumentos.Children.Add(
                CriarDocumento(
                    "Acidente nas Torres Gêmeas",
                    "11/09/2001",
                    "Celso Portiolli"
                )
            );

            areaInterna.Children.Add(listaDocumentos);


            // Coloca tudo dentro do Frame
            areaDocumentos.Content = areaInterna;

            conteudo.Children.Add(areaDocumentos);

            scroll.Content = conteudo;

            Content = scroll;
        }


       
        // CRIAR DOCUMENTO
       

        Frame CriarDocumento(
            string nome,
            string data,
            string destinatario)
        {
            Grid documento = new Grid
            {
                ColumnDefinitions =
                {
                    new ColumnDefinition { Width = 70 },
                    new ColumnDefinition { Width = GridLength.Star },
                    new ColumnDefinition { Width = 45 }
                },

                Padding = new Thickness(15)
            };


            // ÍCONE PDF
            

            Label pdf = new Label
            {
                Text = "PDF",
                FontSize = 15,
                FontAttributes = FontAttributes.Bold,
                TextColor = Color.FromArgb("#222222"),
                BackgroundColor = Color.FromArgb("#EEEEEE"),
                HorizontalTextAlignment = TextAlignment.Center,
                VerticalTextAlignment = TextAlignment.Center,
                HeightRequest = 55,
                WidthRequest = 55
            };


            
            // INFORMAÇÕES
           

            VerticalStackLayout informacoes = new VerticalStackLayout
            {
                Spacing = 3
            };

            Label tituloDocumento = new Label
            {
                Text = nome,
                FontSize = 19,
                FontAttributes = FontAttributes.Bold,
                TextColor = Color.FromArgb("#222222")
            };

            Label detalhes = new Label
            {
                Text = $"{data} • Enviado para: {destinatario}.",
                FontSize = 13,
                TextColor = Color.FromArgb("#444444")
            };

            Label anexo = new Label
            {
                Text = "anexo documento",
                FontSize = 13,
                TextColor = Color.FromArgb("#333333")
            };

            informacoes.Children.Add(tituloDocumento);
            informacoes.Children.Add(detalhes);
            informacoes.Children.Add(anexo);


           
            // MENU ⋮
           

            Button menu = new Button
            {
                Text = "⋮",
                FontSize = 25,
                TextColor = Colors.Black,
                BackgroundColor = Colors.Transparent
            };

            menu.Clicked += async (s, e) =>
            {
                string resposta = await DisplayActionSheet(
                    "Documento",
                    "Cancelar",
                    null,
                    "Abrir",
                    "Baixar",
                    "Excluir"
                );

                if (resposta == "Abrir")
                {
                    await DisplayAlert(
                        "Documento",
                        "Abrindo documento...",
                        "OK"
                    );
                }
            };


            documento.Add(pdf, 0);
            documento.Add(informacoes, 1);
            documento.Add(menu, 2);


            // CARD
          

            return new Frame
            {
                Content = documento,
                BackgroundColor = Colors.White,
                CornerRadius = 12,
                Padding = 0,
                HasShadow = true,
                Margin = new Thickness(0, 5)
            };
        }


        
        // BUSCAR
        

        void BuscarDocumento(object sender, EventArgs e)
        {
            string busca = campoBusca.Text;

            if (string.IsNullOrWhiteSpace(busca))
            {
                foreach (var item in listaDocumentos.Children)
                {
                    if (item is VisualElement visualItem)
                    {
                        visualItem.IsVisible = true;
                    }
                }
                return;
            }

            foreach (var item in listaDocumentos.Children)
            {
                if (item is Frame frame &&
                    frame.Content is Grid grid)
                {
                    bool encontrou = false;

                    foreach (var elemento in grid.Children)
                    {
                        if (elemento is VerticalStackLayout layout)
                        {
                            foreach (var texto in layout.Children)
                            {
                                if (texto is Label label &&
                                    label.Text.Contains(
                                        busca,
                                        StringComparison.OrdinalIgnoreCase))
                                {
                                    encontrou = true;
                                }
                            }
                        }
                    }

                    frame.IsVisible = encontrou;
                }
            }
        }


       
        // ENVIAR DOCUMENTO
       

        async void EnviarDocumento(object sender, EventArgs e)
        {
            await DisplayAlert(
                "Enviar Documento",
                "Aqui você poderá selecionar um documento para enviar.",
                "OK"
            );
        }
    }
}


