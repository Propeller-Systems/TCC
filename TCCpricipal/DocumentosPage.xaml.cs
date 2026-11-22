
using Microsoft.Maui.Controls;
using Microsoft.Maui.Graphics;

namespace TCCpricipal
{
    public partial class DocumentosPage : ContentPage
    {
        private Entry campoBusca;
        private VerticalStackLayout listaDocumentos;
        private Grid modalEnvioDocumento = new();
        private readonly Entry tituloDocumentoEntry = new()
        {
            Placeholder = "Digite o título do documento",
            FontSize = 14,
            TextColor = Color.FromArgb("#222222"),
            BackgroundColor = Colors.White
        };
        private readonly Editor descricaoDocumentoEditor = new()
        {
            Placeholder = "Digite uma descrição ou informações sobre o documento...",
            FontSize = 14,
            TextColor = Color.FromArgb("#222222"),
            BackgroundColor = Colors.White,
            HeightRequest = 170
        };
        private readonly Label arquivoSelecionadoLabel = new()
        {
            Text = "Nenhum arquivo escolhido",
            TextColor = Color.FromArgb("#444444"),
            VerticalTextAlignment = TextAlignment.Center,
            LineBreakMode = LineBreakMode.TailTruncation
        };
        private FileResult? arquivoSelecionado;
        private static readonly HashSet<string> ExtensoesPermitidas = new(StringComparer.OrdinalIgnoreCase)
        {
            ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt"
        };

        public DocumentosPage()
        {
            Title = "Documentos";
            BackgroundColor = Color.FromArgb("#F5F5F5");

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

            Button escolherArquivoButton = new Button
            {
                Text = "Escolher arquivo",
                FontSize = 14,
                TextColor = Color.FromArgb("#333333"),
                BackgroundColor = Color.FromArgb("#E9ECEF"),
                CornerRadius = 4,
                HorizontalOptions = LayoutOptions.Start
            };
            escolherArquivoButton.Clicked += SelecionarArquivo;

            Button fecharModalButton = new Button
            {
                Text = "×",
                FontSize = 24,
                TextColor = Color.FromArgb("#222222"),
                BackgroundColor = Colors.Transparent,
                Padding = new Thickness(8, 0),
                HorizontalOptions = LayoutOptions.End,
                VerticalOptions = LayoutOptions.Center
            };
            fecharModalButton.Clicked += (_, _) => modalEnvioDocumento.IsVisible = false;

            Button cancelarEnvioButton = new Button
            {
                Text = "Cancelar",
                FontSize = 14,
                TextColor = Colors.White,
                BackgroundColor = Color.FromArgb("#DC3545"),
                CornerRadius = 4,
                HorizontalOptions = LayoutOptions.Start
            };
            cancelarEnvioButton.Clicked += (_, _) => modalEnvioDocumento.IsVisible = false;

            Button salvarDocumentoButton = new Button
            {
                Text = "Salvar Documento",
                FontSize = 14,
                TextColor = Colors.White,
                BackgroundColor = Color.FromArgb("#198754"),
                CornerRadius = 4,
                HorizontalOptions = LayoutOptions.Start
            };
            salvarDocumentoButton.Clicked += SalvarDocumento;

            Grid cabecalhoModal = new Grid
            {
                ColumnDefinitions =
                {
                    new ColumnDefinition { Width = GridLength.Star },
                    new ColumnDefinition { Width = GridLength.Auto }
                },
                Children =
                {
                    new Label
                    {
                        Text = "Novo Documento",
                        FontSize = 26,
                        FontAttributes = FontAttributes.Bold,
                        TextColor = Color.FromArgb("#222222"),
                        VerticalOptions = LayoutOptions.Center
                    },
                    fecharModalButton
                }
            };
            Grid.SetColumn(fecharModalButton, 1);

            Grid selecaoArquivo = new Grid
            {
                ColumnDefinitions =
                {
                    new ColumnDefinition { Width = GridLength.Auto },
                    new ColumnDefinition { Width = GridLength.Star }
                },
                BackgroundColor = Colors.White,
                ColumnSpacing = 8
            };
            selecaoArquivo.Add(escolherArquivoButton, 0);
            selecaoArquivo.Add(arquivoSelecionadoLabel, 1);

            VerticalStackLayout formulario = new VerticalStackLayout
            {
                Spacing = 8,
                Children =
                {
                    cabecalhoModal,
                    new Label { Text = "Título", TextColor = Color.FromArgb("#333333") },
                    tituloDocumentoEntry,
                    new Label { Text = "Sobre o documento", TextColor = Color.FromArgb("#333333") },
                    descricaoDocumentoEditor,
                    new Label { Text = "Arquivo", TextColor = Color.FromArgb("#333333") },
                    selecaoArquivo,
                    new Label
                    {
                        Text = "Formatos aceitos: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX e TXT.",
                        FontSize = 12,
                        TextColor = Colors.Gray
                    },
                    new HorizontalStackLayout
                    {
                        Spacing = 8,
                        Children = { cancelarEnvioButton, salvarDocumentoButton }
                    }
                }
            };

            modalEnvioDocumento = new Grid
            {
                IsVisible = false,
                BackgroundColor = Color.FromArgb("#66000000"),
                Padding = 12,
                Children =
                {
                    new ScrollView
                    {
                        VerticalOptions = LayoutOptions.Center,
                        Content = new Frame
                        {
                            BackgroundColor = Colors.White,
                            CornerRadius = 14,
                            Padding = new Thickness(28, 24),
                            HasShadow = true,
                            HorizontalOptions = LayoutOptions.Center,
                            MaximumWidthRequest = 760,
                            Content = formulario
                        }
                    }
                }
            };

            Content = new Grid
            {
                Children = { scroll, modalEnvioDocumento }
            };
        }

        // CRIAR DOCUMENTO

        Frame CriarDocumento(
            string nome,
            string data,
            string destinatario,
            string? descricaoDocumento = null,
            string? nomeArquivo = null)
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
                Text = nomeArquivo ?? "anexo documento",
                FontSize = 13,
                TextColor = Color.FromArgb("#333333")
            };

            informacoes.Children.Add(tituloDocumento);
            informacoes.Children.Add(detalhes);
            if (!string.IsNullOrWhiteSpace(descricaoDocumento))
            {
                informacoes.Children.Add(new Label
                {
                    Text = descricaoDocumento,
                    FontSize = 13,
                    TextColor = Color.FromArgb("#444444")
                });
            }
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
            modalEnvioDocumento.IsVisible = true;
            await Task.CompletedTask;
        }

        async void SelecionarArquivo(object sender, EventArgs e)
        {
            try
            {
                FileResult? arquivo = await FilePicker.Default.PickAsync(new PickOptions
                {
                    PickerTitle = "Escolha um documento"
                });

                if (arquivo is null)
                    return;

                string extensao = Path.GetExtension(arquivo.FileName);
                if (!ExtensoesPermitidas.Contains(extensao))
                {
                    await DisplayAlert(
                        "Formato não aceito",
                        "Selecione um arquivo PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX ou TXT.",
                        "OK"
                    );
                    return;
                }

                arquivoSelecionado = arquivo;
                arquivoSelecionadoLabel.Text = arquivo.FileName;
            }
            catch (Exception ex)
            {
                await DisplayAlert("Erro ao selecionar arquivo", ex.Message, "OK");
            }
        }

        async void SalvarDocumento(object sender, EventArgs e)
        {
            string titulo = tituloDocumentoEntry.Text?.Trim() ?? string.Empty;
            if (string.IsNullOrWhiteSpace(titulo) || arquivoSelecionado is null)
            {
                await DisplayAlert(
                    "Campos obrigatórios",
                    "Informe o título e escolha um arquivo para salvar o documento.",
                    "OK"
                );
                return;
            }

            listaDocumentos.Children.Insert(0, CriarDocumento(
                titulo,
                DateTime.Now.ToString("dd/MM/yyyy"),
                "Enviado por você",
                descricaoDocumentoEditor.Text?.Trim(),
                arquivoSelecionado.FileName
            ));

            tituloDocumentoEntry.Text = string.Empty;
            descricaoDocumentoEditor.Text = string.Empty;
            arquivoSelecionado = null;
            arquivoSelecionadoLabel.Text = "Nenhum arquivo escolhido";
            modalEnvioDocumento.IsVisible = false;
        }
    }
}

