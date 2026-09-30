using System.ComponentModel;
using System.IO;
using Microsoft.Maui.Storage;

namespace TCCpricipal
{
	public partial class TelaDeResultados : ContentPage, INotifyPropertyChanged
	{
		ImageSource _card1Image = ImageSource.FromFile("totaldefuncionarios.png");
		ImageSource _card2Image = ImageSource.FromFile("funcionariosativos.png");
		ImageSource _card3Image = ImageSource.FromFile("emliceca.png");
		ImageSource _card4Image = ImageSource.FromFile("novascontratacoes.png");

		public event PropertyChangedEventHandler? PropertyChanged;

		public ImageSource Card1Image { get => _card1Image; set { _card1Image = value; OnPropertyChanged("Card1Image"); } }
		public ImageSource Card2Image { get => _card2Image; set { _card2Image = value; OnPropertyChanged("Card2Image"); } }
		public ImageSource Card3Image { get => _card3Image; set { _card3Image = value; OnPropertyChanged("Card3Image"); } }
		public ImageSource Card4Image { get => _card4Image; set { _card4Image = value; OnPropertyChanged("Card4Image"); } }

		public TelaDeResultados()
		{
			InitializeComponent();
			BindingContext = this;

			// adiciona gesto de toque nas imagens para permitir seleção
			var g1 = new TapGestureRecognizer();
			g1.Tapped += async (s, e) => await PickAndSetImageAsync(1);
			Card1ImageView.GestureRecognizers.Add(g1);

			var g2 = new TapGestureRecognizer();
			g2.Tapped += async (s, e) => await PickAndSetImageAsync(2);
			Card2ImageView.GestureRecognizers.Add(g2);

			var g3 = new TapGestureRecognizer();
			g3.Tapped += async (s, e) => await PickAndSetImageAsync(3);
			Card3ImageView.GestureRecognizers.Add(g3);

			var g4 = new TapGestureRecognizer();
			g4.Tapped += async (s, e) => await PickAndSetImageAsync(4);
			Card4ImageView.GestureRecognizers.Add(g4);
		}

		void OnPropertyChanged(string name) => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));

		async System.Threading.Tasks.Task PickAndSetImageAsync(int card)
		{
			try
			{
				var result = await FilePicker.Default.PickAsync(new PickOptions
				{
					PickerTitle = "Escolha uma imagem",
					FileTypes = FilePickerFileType.Images
				});

				if (result == null) return;

				using var stream = await result.OpenReadAsync();
				using var ms = new MemoryStream();
				await stream.CopyToAsync(ms);
				var bytes = ms.ToArray();
				ImageSource src = ImageSource.FromStream(() => new MemoryStream(bytes));

				switch (card)
				{
					case 1: Card1Image = src; break;
					case 2: Card2Image = src; break;
					case 3: Card3Image = src; break;
					case 4: Card4Image = src; break;
				}
			}
			catch (Exception ex)
			{
				await DisplayAlert("Erro", $"Não foi possível carregar a imagem: {ex.Message}", "OK");
			}
		}
	}
}
