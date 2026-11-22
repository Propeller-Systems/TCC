using Microsoft.Maui.Controls;
using Microsoft.Maui.Graphics;
using Microsoft.Maui.Controls.Shapes;

namespace TCCpricipal
{
    public partial class ProfilePage : ContentPage
    {
        public ProfilePage()
        {
            Title = "Meu perfil";
            BackgroundColor = Color.FromArgb("#F3F4F6");

            var sairButton = new Button
            {
                Text = "⇦  Sair",
                FontSize = 14,
                TextColor = Color.FromArgb("#A63D3D"),
                BackgroundColor = Colors.White,
                BorderColor = Color.FromArgb("#E1E4E8"),
                BorderWidth = 1,
                CornerRadius = 10,
                Padding = new Thickness(14, 8),
                HorizontalOptions = LayoutOptions.End,
                VerticalOptions = LayoutOptions.Center
            };
            sairButton.Clicked += SairClicked;

            var cabecalho = new Grid
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
                        Text = "Meu perfil",
                        FontSize = 26,
                        FontAttributes = FontAttributes.Bold,
                        TextColor = Color.FromArgb("#171717"),
                        VerticalOptions = LayoutOptions.Center
                    },
                    sairButton
                }
            };
            Grid.SetColumn(sairButton, 1);

            var banner = new Grid
            {
                HeightRequest = 100,
                BackgroundColor = Color.FromArgb("#202020"),
                Clip = new RoundRectangleGeometry { CornerRadius = new CornerRadius(14, 14, 0, 0) },
                Children =
                {
                    new Border
                    {
                        WidthRequest = 180,
                        HeightRequest = 180,
                        Stroke = Color.FromArgb("#393939"),
                        StrokeThickness = 1,
                        BackgroundColor = Colors.Transparent,
                        StrokeShape = new Ellipse(),
                        HorizontalOptions = LayoutOptions.End,
                        VerticalOptions = LayoutOptions.Center,
                        Margin = new Thickness(0, 0, 24, 0)
                    },
                    new Border
                    {
                        WidthRequest = 120,
                        HeightRequest = 120,
                        Stroke = Color.FromArgb("#393939"),
                        StrokeThickness = 1,
                        BackgroundColor = Colors.Transparent,
                        StrokeShape = new Ellipse(),
                        HorizontalOptions = LayoutOptions.End,
                        VerticalOptions = LayoutOptions.Center,
                        Margin = new Thickness(0, 0, 72, 0)
                    }
                }
            };

            var avatar = new Border
            {
                WidthRequest = 76,
                HeightRequest = 76,
                BackgroundColor = Color.FromArgb("#DCE6EA"),
                Stroke = Colors.White,
                StrokeThickness = 4,
                StrokeShape = new Ellipse(),
                Shadow = new Shadow { Brush = Colors.Black, Opacity = 0.18f, Radius = 8, Offset = new Point(0, 3) },
                Content = new Label
                {
                    Text = "A",
                    FontSize = 32,
                    FontAttributes = FontAttributes.Bold,
                    TextColor = Color.FromArgb("#314552"),
                    HorizontalTextAlignment = TextAlignment.Center,
                    VerticalTextAlignment = TextAlignment.Center
                }
            };

            var identificacao = new Grid
            {
                ColumnDefinitions =
                {
                    new ColumnDefinition { Width = GridLength.Auto },
                    new ColumnDefinition { Width = GridLength.Star }
                },
                ColumnSpacing = 14,
                Padding = new Thickness(22, 0, 18, 14),
                Children =
                {
                    avatar,
                    new VerticalStackLayout
                    {
                        Spacing = 4,
                        VerticalOptions = LayoutOptions.Center,
                        Children =
                        {
                            new Label
                            {
                                Text = "admin",
                                FontSize = 22,
                                FontAttributes = FontAttributes.Bold,
                                TextColor = Color.FromArgb("#202A35")
                            },
                            new Border
                            {
                                BackgroundColor = Color.FromArgb("#E9F1F6"),
                                Stroke = Colors.Transparent,
                                StrokeShape = new RoundRectangle { CornerRadius = 12 },
                                Padding = new Thickness(10, 4),
                                HorizontalOptions = LayoutOptions.Start,
                                Content = new Label
                                {
                                    Text = "Administrador",
                                    FontSize = 12,
                                    TextColor = Color.FromArgb("#45677D")
                                }
                            }
                        }
                    }
                }
            };
            identificacao.SetColumn(identificacao.Children[1], 1);

            var separador = new BoxView
            {
                HeightRequest = 1,
                BackgroundColor = Color.FromArgb("#ECEFF1"),
                Margin = new Thickness(20, 0)
            };

            var informacoes = new Grid
            {
                ColumnDefinitions =
                {
                    new ColumnDefinition { Width = GridLength.Star },
                    new ColumnDefinition { Width = GridLength.Star }
                },
                ColumnSpacing = 12,
                Padding = new Thickness(20, 14, 20, 20),
                Children =
                {
                    CriarCampo("E-MAIL", "admin@gmail.com"),
                    CriarCampo("TIPO DE ACESSO", "Administrador")
                }
            };
            informacoes.SetColumn(informacoes.Children[1], 1);

            var cartaoPerfil = new Frame
            {
                BackgroundColor = Colors.White,
                CornerRadius = 14,
                Padding = 0,
                HasShadow = true,
                Content = new VerticalStackLayout
                {
                    Spacing = 0,
                    Children = { banner, identificacao, separador, informacoes }
                }
            };

            Content = new ScrollView
            {
                Content = new VerticalStackLayout
                {
                    Padding = new Thickness(20, 18),
                    Spacing = 18,
                    Children = { cabecalho, cartaoPerfil }
                }
            };
        }

        private static Frame CriarCampo(string rotulo, string valor)
        {
            return new Frame
            {
                BackgroundColor = Color.FromArgb("#F2F2F2"),
                BorderColor = Color.FromArgb("#E5E5E5"),
                CornerRadius = 12,
                Padding = new Thickness(14, 12),
                HasShadow = false,
                Content = new VerticalStackLayout
                {
                    Spacing = 6,
                    Children =
                    {
                        new Label
                        {
                            Text = rotulo,
                            FontSize = 11,
                            FontAttributes = FontAttributes.Bold,
                            TextColor = Color.FromArgb("#7A8792")
                        },
                        new Label
                        {
                            Text = valor,
                            FontSize = 14,
                            TextColor = Color.FromArgb("#26323B"),
                            LineBreakMode = LineBreakMode.WordWrap
                        }
                    }
                }
            };
        }

        private async void SairClicked(object? sender, EventArgs e)
        {
            bool sair = await DisplayAlert("Sair", "Deseja sair da sua conta?", "Sair", "Cancelar");
            if (sair)
                await Navigation.PushModalAsync(new MainPage());
        }
    }
}
